package com.example.managementsystem.controller;

import com.example.managementsystem.common.Result;
import com.example.managementsystem.entity.CaseInfo;
import com.example.managementsystem.entity.User;
import com.example.managementsystem.service.ICaseInfoService;
import com.example.managementsystem.service.IUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 聚合大盘接口，减少前端大量细粒度请求，提升性能
 * @author example
 */
@RestController
@RequestMapping("/dashboard")
@Slf4j
public class DashboardController {

    @Autowired
    private ICaseInfoService caseInfoService;

    @Autowired
    private IUserService userService;

    private static final List<String> ADMIN_STATUS_DIST = Arrays.asList("退回","待结案","结案","已领取","延期","反馈");
    private static final List<String> MEDIATOR_STATUS_DIST = Arrays.asList("已领取","反馈","延期","待结案");

    /**
     * 管理员大盘聚合
     * @param stations 逗号分隔驻点，例如 九堡,彭埠,本部,笕桥
     * @param days 退回趋势天数（默认7）
     */
    @GetMapping("/admin")
    public Result<Map<String,Object>> adminDashboard(@RequestParam String stations,
                                                      @RequestParam(required = false, defaultValue = "7") Integer days) {
        List<String> stationList = Arrays.stream(stations.split(","))
                .map(String::trim).filter(s-> !s.isEmpty()).collect(Collectors.toList());
        if (stationList.isEmpty()) {
            return Result.success(Collections.emptyMap());
        }
        Map<String,Object> resp = new HashMap<>();
        Map<String,Integer> totalCompare = new LinkedHashMap<>();
        Map<String,Map<String,Integer>> statusDistribution = new LinkedHashMap<>();
        Map<String,Integer> pendingDuration = new LinkedHashMap<>();
        List<LocalDate> dateRange = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = days-1; i >=0; i--) { dateRange.add(today.minusDays(i)); }
        Map<String,List<Integer>> returnTrendSeries = new LinkedHashMap<>();

        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (String st : stationList) {
            // station 合并逻辑：前端若传"九堡彭埠"则拆分，当前约定直接传单独驻点避免额外查询
            // 拉取该驻点的所有案件（利用分页服务内部 mapper，直接用 wrapper)
            // 由于 service 层没有直接根据 station 返回全部接口，这里使用自定义查询：重用 selectCasePage 分页多次取完
            List<CaseInfo> stationCases = loadAllCasesByStation(st);
            totalCompare.put(st, stationCases.size());
            // 状态分布
            Map<String,Integer> dist = new LinkedHashMap<>();
            ADMIN_STATUS_DIST.forEach(s -> dist.put(s,0));
            for (CaseInfo c: stationCases) {
                if (dist.containsKey(c.getStatus())) {
                    dist.put(c.getStatus(), dist.get(c.getStatus())+1);
                }
            }
            statusDistribution.put(st, dist);
            // 待结案平均处理时长
            long sum = 0; int cnt = 0;
            for (CaseInfo c: stationCases) {
                if ("待结案".equals(c.getStatus())) {
                    LocalDateTime base = c.getReceiveTime();
                    if (base == null && c.getCourtReceiveTime()!=null) {
                        try { base = LocalDate.parse(c.getCourtReceiveTime().substring(0,10)).atStartOfDay(); } catch (Exception ignored) {}
                    }
                    if (base != null) {
                        long d = Duration.between(base, now).toDays();
                        if (d>=0) { sum += d; cnt++; }
                    }
                }
            }
            pendingDuration.put(st, cnt==0?0:(int)Math.round(sum*1.0/cnt));
            // 退回趋势：根据 return_court_time 存在则用它，否则 fallback court_receive_time
            List<Integer> trendCounts = new ArrayList<>();
            for (LocalDate d: dateRange) {
                int dayCnt = 0;
                for (CaseInfo c: stationCases) {
                    if (!"退回".equals(c.getStatus())) { continue; }
                    String dateStr = null;
                    if (c.getReturnCourtTime()!=null && !c.getReturnCourtTime().isEmpty()) {
                        dateStr = c.getReturnCourtTime().substring(0,10);
                    } else if (c.getCourtReceiveTime()!=null) {
                        dateStr = c.getCourtReceiveTime().substring(0,10);
                    }
                    if (dateStr!=null && dateStr.equals(d.format(dateFmt))) {
                        dayCnt++;
                    }
                }
                trendCounts.add(dayCnt);
            }
            returnTrendSeries.put(st, trendCounts);
        }
        // 阈值：各驻点待结案平均值的平均
        OptionalDouble avgOpt = pendingDuration.values().stream().filter(v-> v>0).mapToInt(Integer::intValue).average();
        int threshold = avgOpt.isPresent()? (int)Math.round(avgOpt.getAsDouble()) : 0;

        Map<String,Object> returnTrend = new HashMap<>();
        returnTrend.put("dates", dateRange.stream().map(d-> d.format(dateFmt)).collect(Collectors.toList()));
        returnTrend.put("series", returnTrendSeries);

        resp.put("totalCompare", totalCompare);
        resp.put("statusDistribution", statusDistribution);
        resp.put("pendingDuration", pendingDuration);
        resp.put("pendingDurationThreshold", threshold);
        resp.put("returnTrend", returnTrend);
        return Result.success(resp);
    }

    /**
     * 调解员大盘聚合
     */
    @GetMapping("/mediator")
    public Result<Map<String,Object>> mediatorDashboard(@RequestParam String userName,
                                                         @RequestParam(required = false, defaultValue = "7") Integer timeoutDays,
                                                         @RequestParam(required = false, defaultValue = "30") Integer efficiencyDays) {
        User user = userService.searchUserByUsername(userName);
        if (user == null) {
            return Result.fail("用户不存在");
        }
        Long userId = user.getUserId();
        // 获取该用户相关案件（领取人）与结案案件
        List<CaseInfo> userCases = loadAllCasesByUser(userId);
        List<CaseInfo> closedCases = userCases.stream().filter(c -> "结案".equals(c.getStatus())).collect(Collectors.toList());

        Map<String,Object> resp = new HashMap<>();
        Map<String,Integer> statusDist = new LinkedHashMap<>();
        MEDIATOR_STATUS_DIST.forEach(s -> statusDist.put(s,0));
        for (CaseInfo c: userCases) {
            if (statusDist.containsKey(c.getStatus())) {
                statusDist.put(c.getStatus(), statusDist.get(c.getStatus())+1);
            }
        }
        // 即将超时趋势：近 timeoutDays 天每天统计即将超时案件数（复用系统逻辑）
        LocalDate today = LocalDate.now();
        List<LocalDate> timeoutDateRange = new ArrayList<>();
        for (int i = timeoutDays-1; i >=0; i--) { timeoutDateRange.add(today.minusDays(i)); }
        List<Integer> timeoutCounts = new ArrayList<>();
        Map<String,List<Long>> timeoutCaseIdsPerDay = new LinkedHashMap<>();
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (LocalDate d: timeoutDateRange) {
            int count = 0; List<Long> ids = new ArrayList<>();
            for (CaseInfo c: userCases) {
                if (!isPotentialTimeout(c)) { continue; }
                LocalDate receiveDay = null;
                if (c.getReceiveTime()!=null) { receiveDay = c.getReceiveTime().toLocalDate(); }
                else if (c.getCourtReceiveTime()!=null) {
                    try { receiveDay = LocalDate.parse(c.getCourtReceiveTime().substring(0,10)); } catch (Exception ignored) {}
                }
                if (receiveDay!=null && receiveDay.equals(d)) { count++; ids.add(c.getCaseId()); }
            }
            timeoutCounts.add(count); timeoutCaseIdsPerDay.put(d.format(dateFmt), ids);
        }
        // 处理效率趋势：近 efficiencyDays 天每天结案数
        List<LocalDate> effDateRange = new ArrayList<>();
        for (int i = efficiencyDays-1; i >=0; i--) { effDateRange.add(today.minusDays(i)); }
        List<Integer> efficiencyCounts = new ArrayList<>();
        for (LocalDate d: effDateRange) {
            int c = 0;
            for (CaseInfo ci: closedCases) {
                LocalDate closeDay = null;
                if (ci.getUpdatedTime()!=null && ci.getUpdatedTime().length()>=10) {
                    try { closeDay = LocalDate.parse(ci.getUpdatedTime().substring(0,10)); } catch (Exception ignored) {}
                } else if (ci.getReceiveTime()!=null) { closeDay = ci.getReceiveTime().toLocalDate(); }
                if (closeDay!=null && closeDay.equals(d)) { c++; }
            }
            efficiencyCounts.add(c);
        }
        double avg = efficiencyCounts.stream().mapToInt(Integer::intValue).average().orElse(0.0);

        Map<String,Object> timeoutTrend = new HashMap<>();
        timeoutTrend.put("dates", timeoutDateRange.stream().map(d-> d.format(dateFmt)).collect(Collectors.toList()));
        timeoutTrend.put("counts", timeoutCounts);
        timeoutTrend.put("caseIdsMap", timeoutCaseIdsPerDay);

        Map<String,Object> efficiencyTrend = new HashMap<>();
        efficiencyTrend.put("dates", effDateRange.stream().map(d-> d.format(dateFmt)).collect(Collectors.toList()));
        efficiencyTrend.put("counts", efficiencyCounts);
        efficiencyTrend.put("avg", avg);

        resp.put("statusDistribution", statusDist);
        resp.put("timeoutTrend", timeoutTrend);
        resp.put("efficiencyTrend", efficiencyTrend);
        return Result.success(resp);
    }

    /**
     * 判定是否属于即将超时（复用系统逻辑）
     */
    private boolean isPotentialTimeout(CaseInfo c) {
        if (c.getReceiveTime()==null) { return false; }
        LocalDateTime now = LocalDateTime.now();
        long days = Duration.between(c.getReceiveTime(), now).toDays();
        String status = c.getStatus();
        String receiveType = c.getReceiveType();
        if ("self_receive".equals(receiveType)) {
            if ("已领取".equals(status) && days >0 && days <=3) { return true; }
            if ("反馈".equals(status) && days >=12 && days <=15) { return true; }
        }
        if ("assign".equals(receiveType) && ("已领取".equals(status) || "反馈".equals(status))) {
            boolean inRange = days >=7 && days <=10;
            if (inRange) { return true; }
        }
        return false;
    }

    /**
     * 以分页形式抓取该 station 全部案件（受 pageSize=100 限制，循环抓取）
     */
    private List<CaseInfo> loadAllCasesByStation(String station) {
        List<CaseInfo> all = new ArrayList<>();
        int pageNum = 1; int pageSize = 100; while (true) {
            Map<String,Object> page = caseInfoService.getCasePage(null,null,null,null,null,null,null,null,null,station,pageNum,pageSize,null,null,null,null);
            if (page == null) { break; }
            @SuppressWarnings("unchecked") List<CaseInfo> records = (List<CaseInfo>) page.get("records");
            if (records == null || records.isEmpty()) { break; }
            all.addAll(records);
            int total = (int) page.get("total");
            if (all.size() >= total) { break; }
            pageNum++;
        }
        return all;
    }

    /**
     * 抓取该用户所有案件（分页迭代）
     */
    private List<CaseInfo> loadAllCasesByUser(Long userId) {
        List<CaseInfo> all = new ArrayList<>();
        int pageNum = 1; int pageSize = 100; while (true) {
            Map<String,Object> page = caseInfoService.getCasePage(null,null,null,null,null,null,null,null,null,null,pageNum,pageSize,null,null,null,null);
            if (page == null) { break; }
            @SuppressWarnings("unchecked") List<CaseInfo> records = (List<CaseInfo>) page.get("records");
            if (records == null || records.isEmpty()) { break; }
            for (CaseInfo c: records) {
                if (c.getUserId()!=null && c.getUserId().equals(userId)) {
                    all.add(c);
                }
            }
            int total = (int) page.get("total");
            if (pageNum * pageSize >= total) { break; }
            pageNum++;
        }
        return all;
    }
}
