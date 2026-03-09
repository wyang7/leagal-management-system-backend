package com.example.managementsystem.adapter.wecom;

import com.example.managementsystem.adapter.wecom.dto.WeComMessage;
import com.example.managementsystem.adapter.wecom.dto.WeComMessageResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import javax.annotation.PostConstruct;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * 企业微信群机器人适配器实现类
 *
 * @author example
 * @since 1.0.0
 */
@Slf4j
@Component
public class WeComGroupBotAdapterImpl implements WeComGroupBotAdapter {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * 单例实例（静态方式，便于非Spring环境使用）
     */
    private static WeComGroupBotAdapterImpl instance;

    @Autowired
    public WeComGroupBotAdapterImpl(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        instance = this;
    }

    /**
     * 获取单例实例（用于静态调用）
     *
     * @return 适配器实例
     */
    public static WeComGroupBotAdapterImpl getInstance() {
        return instance;
    }

    @Override
    public WeComMessageResponse sendText(String webhookUrl, String content) {
        return sendText(webhookUrl, content, null, null);
    }

    @Override
    public WeComMessageResponse sendText(String webhookUrl, String content,
                                         String[] mentionedList, String[] mentionedMobileList) {
        List<String> mentionList = mentionedList != null ? Arrays.asList(mentionedList) : null;
        List<String> mentionMobileList = mentionedMobileList != null ? Arrays.asList(mentionedMobileList) : null;
        WeComMessage message = WeComMessage.createText(content, mentionList, mentionMobileList);
        return sendMessage(webhookUrl, message);
    }

    @Override
    public WeComMessageResponse sendMarkdown(String webhookUrl, String content) {
        WeComMessage message = WeComMessage.createMarkdown(content);
        return sendMessage(webhookUrl, message);
    }

    @Override
    public WeComMessageResponse sendMessage(String webhookUrl, WeComMessage message) {
        if (webhookUrl == null || webhookUrl.trim().isEmpty()) {
            log.error("企业微信webhook地址不能为空");
            WeComMessageResponse errorResponse = new WeComMessageResponse();
            errorResponse.setErrCode(-1);
            errorResponse.setErrMsg("webhook地址不能为空");
            return errorResponse;
        }

        if (message == null) {
            log.error("消息内容不能为空");
            WeComMessageResponse errorResponse = new WeComMessageResponse();
            errorResponse.setErrCode(-1);
            errorResponse.setErrMsg("消息内容不能为空");
            return errorResponse;
        }

        try {
            String jsonBody = objectMapper.writeValueAsString(message);
            log.debug("发送企业微信消息，URL: {}, 内容: {}", webhookUrl, jsonBody);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

            HttpEntity<String> requestEntity = new HttpEntity<>(jsonBody, headers);

            ResponseEntity<WeComMessageResponse> response = restTemplate.postForEntity(
                    webhookUrl, requestEntity, WeComMessageResponse.class);

            WeComMessageResponse result = response.getBody();
            if (result == null) {
                log.error("企业微信返回空响应");
                WeComMessageResponse errorResponse = new WeComMessageResponse();
                errorResponse.setErrCode(-1);
                errorResponse.setErrMsg("返回空响应");
                return errorResponse;
            }

            if (result.isSuccess()) {
                log.info("企业微信消息发送成功");
            } else {
                log.error("企业微信消息发送失败，错误码: {}, 错误信息: {}",
                        result.getErrCode(), result.getErrMsg());
            }

            return result;

        } catch (JsonProcessingException e) {
            log.error("序列化企业微信消息失败", e);
            WeComMessageResponse errorResponse = new WeComMessageResponse();
            errorResponse.setErrCode(-1);
            errorResponse.setErrMsg("消息序列化失败: " + e.getMessage());
            return errorResponse;
        } catch (RestClientException e) {
            log.error("发送企业微信消息HTTP请求失败", e);
            WeComMessageResponse errorResponse = new WeComMessageResponse();
            errorResponse.setErrCode(-1);
            errorResponse.setErrMsg("HTTP请求失败: " + e.getMessage());
            return errorResponse;
        } catch (Exception e) {
            log.error("发送企业微信消息时发生未知错误", e);
            WeComMessageResponse errorResponse = new WeComMessageResponse();
            errorResponse.setErrCode(-1);
            errorResponse.setErrMsg("未知错误: " + e.getMessage());
            return errorResponse;
        }
    }

    // ==================== 静态工具方法 ====================

    /**
     * 静态方法：发送文本消息
     *
     * @param webhookUrl 群机器人webhook地址
     * @param content    消息内容
     * @return 发送结果响应
     */
    public static WeComMessageResponse sendTextMessage(String webhookUrl, String content) {
        if (instance == null) {
            throw new IllegalStateException("WeComGroupBotAdapter尚未初始化");
        }
        return instance.sendText(webhookUrl, content);
    }

    /**
     * 静态方法：发送Markdown消息
     *
     * @param webhookUrl 群机器人webhook地址
     * @param content    Markdown内容
     * @return 发送结果响应
     */
    public static WeComMessageResponse sendMarkdownMessage(String webhookUrl, String content) {
        if (instance == null) {
            throw new IllegalStateException("WeComGroupBotAdapter尚未初始化");
        }
        return instance.sendMarkdown(webhookUrl, content);
    }

    /**
     * 静态方法：发送通用消息
     *
     * @param webhookUrl 群机器人webhook地址
     * @param message    消息对象
     * @return 发送结果响应
     */
    public static WeComMessageResponse sendWeComMessage(String webhookUrl, WeComMessage message) {
        if (instance == null) {
            throw new IllegalStateException("WeComGroupBotAdapter尚未初始化");
        }
        return instance.sendMessage(webhookUrl, message);
    }
}
