package com.example.managementsystem.adapter.wecom;

import com.example.managementsystem.adapter.wecom.dto.WeComMessage;
import com.example.managementsystem.adapter.wecom.dto.WeComMessageResponse;

/**
 * 企业微信群机器人适配器接口
 * 用于通过webhook方式发送企业微信群消息
 *
 * @author example
 * @since 1.0.0
 */
public interface WeComGroupBotAdapter {

    /**
     * 发送文本消息
     *
     * @param webhookUrl 群机器人webhook地址
     * @param content    消息内容
     * @return 发送结果响应
     */
    WeComMessageResponse sendText(String webhookUrl, String content);

    /**
     * 发送文本消息（支持@成员）
     *
     * @param webhookUrl         群机器人webhook地址
     * @param content            消息内容
     * @param mentionedList      @成员的用户ID列表，@all表示@所有人
     * @param mentionedMobileList @成员的手机号列表
     * @return 发送结果响应
     */
    WeComMessageResponse sendText(String webhookUrl, String content,
                                  String[] mentionedList, String[] mentionedMobileList);

    /**
     * 发送Markdown消息
     *
     * @param webhookUrl 群机器人webhook地址
     * @param content    Markdown格式的消息内容
     * @return 发送结果响应
     */
    WeComMessageResponse sendMarkdown(String webhookUrl, String content);

    /**
     * 发送通用消息
     *
     * @param webhookUrl 群机器人webhook地址
     * @param message    消息对象
     * @return 发送结果响应
     */
    WeComMessageResponse sendMessage(String webhookUrl, WeComMessage message);
}
