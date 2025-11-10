// 通用图表封装 (ECharts 5)
// 约定：所有函数返回 { chart, setLoading(boolean) }

function createBarChart(domId, {title='', xData=[], yData=[], horizontal=false, colors=['#1677ff'], unit='', onClick} = {}) {
    const el = document.getElementById(domId);
    if (!el) return null;
    const chart = echarts.init(el);
    const option = {
        title: title? { text: title, left: 'center', top: 4, textStyle: { fontSize: 13, fontWeight: 500 } }: undefined,
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: v => unit? v + unit : v },
        grid: { top: title? 42: 20, left: 50, right: 20, bottom: 40 },
        xAxis: horizontal? { type: 'value' } : { type: 'category', data: xData, axisLabel:{ interval:0 } },
        yAxis: horizontal? { type: 'category', data: xData } : { type: 'value' },
        series: [{ type: 'bar', data: yData, itemStyle:{ color: colors[0] }, barMaxWidth: 42 }],
        animationDuration: 500
    };
    chart.setOption(option);
    if (onClick) {
        chart.off('click');
        chart.on('click', params => onClick(params));
    }
    function update(data) {
        chart.setOption({
            xAxis: horizontal? { type:'value' } : { type:'category', data: data.xData },
            yAxis: horizontal? { type:'category', data: data.xData } : { type:'value' },
            series: [{ data: data.yData }]
        });
    }
    function setLoading(loading) { loading? chart.showLoading('default',{text:'加载中...'}) : chart.hideLoading(); }
    window.addEventListener('resize', ()=> chart.resize());
    return { chart, update, setLoading };
}

function createMultiLineChart(domId, {title='', legend=[], xData=[], seriesData=[], thresholdConfig} = {}) {
    const el = document.getElementById(domId); if (!el) return null;
    const chart = echarts.init(el);
    const colors = ['#1677ff','#52c41a','#fa8c16','#eb2f96','#13c2c2','#722ed1'];
    const option = {
        title: title? { text: title, left:'center', top:4, textStyle:{ fontSize:13,fontWeight:500 } }: undefined,
        tooltip: { trigger:'axis' },
        legend: { top: 26, data: legend },
        grid: { top: legend.length? 60: 32, left: 50, right: 20, bottom: 40 },
        xAxis: { type:'category', data: xData },
        yAxis: { type:'value' },
        series: seriesData.map((s,i)=> ({ name:s.name, type:'line', smooth:true, data:s.data, showSymbol:false, lineStyle:{ width:2 }, itemStyle:{ color: colors[i%colors.length] }}))
    };
    if (thresholdConfig) {
        option.series.forEach(ser => { ser.markLine = { data:[{ yAxis: thresholdConfig.value, name: thresholdConfig.label }], lineStyle:{ type:'dashed', color:'#ff4d4f' }, label:{ formatter: thresholdConfig.label + ':' + thresholdConfig.value } }; });
    }
    chart.setOption(option);
    function update({xData:newX, seriesData:newSeries}) {
        chart.setOption({ xAxis:{ data:newX }, series: newSeries.map((s,i)=> ({ name:s.name, type:'line', smooth:true, data:s.data, showSymbol:false, lineStyle:{ width:2 }, itemStyle:{ color: colors[i%colors.length] }})) });
    }
    function setLoading(l){ l? chart.showLoading('default',{text:'加载中...'}) : chart.hideLoading(); }
    window.addEventListener('resize', ()=> chart.resize());
    return { chart, update, setLoading };
}

function createPieChart(domId, {title='', data=[], ring=true, legendBottom=false, onClick, onLegendClick} = {}) {
    const el = document.getElementById(domId); if (!el) return null;
    const chart = echarts.init(el);
    const option = {
        title: title? { text: title, left:'center', top: 6, textStyle:{ fontSize:13,fontWeight:500 } }: undefined,
        tooltip: { trigger:'item', valueFormatter: v=> v },
        legend: legendBottom? { bottom: 0 } : { top: 28 },
        grid: { top: 0 },
        series: [{
            name: title,
            type:'pie',
            radius: ring? ['45%','70%'] : '70%',
            center:['50%','55%'],
            avoidLabelOverlap:true,
            itemStyle:{ borderColor:'#fff', borderWidth:1 },
            label:{ formatter:'{b}\n{c} ({d}%)', fontSize:11 },
            data: data
        }]
    };
    chart.setOption(option);
    if (onClick) { chart.off('click'); chart.on('click', p=> onClick(p)); }
    if (onLegendClick) { chart.off('legendselectchanged'); chart.on('legendselectchanged', e => { const selectedNames = Object.keys(e.selected).filter(k=> e.selected[k]); if (selectedNames.length) { onLegendClick(selectedNames[selectedNames.length-1]); } }); }
    function update({data:newData, title:newTitle}) {
        chart.setOption({ title: newTitle? { text:newTitle } : undefined, series:[{ data:newData }] });
    }
    function setLoading(l){ l? chart.showLoading('default',{text:'加载中...'}) : chart.hideLoading(); }
    window.addEventListener('resize', ()=> chart.resize());
    return { chart, update, setLoading };
}

// 专用：带平均参考线的柱状图（处理效率）
function createBarWithAvg(domId, {title='', xData=[], yData=[], avg=0, onClick} = {}) {
    const el = document.getElementById(domId); if (!el) return null;
    const chart = echarts.init(el);
    const option = {
        title: title? { text: title, left:'center', top:4, textStyle:{ fontSize:13,fontWeight:500 } }: undefined,
        tooltip: { trigger:'axis' },
        grid: { top: 40, left: 50, right: 20, bottom: 40 },
        xAxis: { type:'category', data: xData },
        yAxis: { type:'value' },
        series: [{ type:'bar', data:yData, itemStyle:{ color:'#1677ff' }, barMaxWidth:38, markLine:{ data:[{ yAxis: avg, name:'平均' }], lineStyle:{ type:'dashed', color:'#fa541c' }, label:{ formatter:'平均:'+avg.toFixed?avg.toFixed(1):avg } } }]
    };
    chart.setOption(option);
    if (onClick) chart.on('click', p=> onClick(p));
    function update({xData:newX,yData:newY,avg:newAvg}) { chart.setOption({ xAxis:{ data:newX }, series:[{ data:newY, markLine:{ data:[{ yAxis:newAvg, name:'平均' }] } }] }); }
    function setLoading(l){ l? chart.showLoading('default',{text:'加载中...'}) : chart.hideLoading(); }
    window.addEventListener('resize', ()=> chart.resize());
    return { chart, update, setLoading };
}

window.ChartUtils = { createBarChart, createMultiLineChart, createPieChart, createBarWithAvg };
