package com.example.managementsystem.adapter.wecom;

import com.example.managementsystem.adapter.wecom.dto.WeComMessage;
import com.example.managementsystem.adapter.wecom.dto.WeComMessageResponse;

import java.util.List;

/**
 * 企业微信群机器人工具类
 * 提供简洁的静态方法发送消息
 *
 * <p>使用示例：</p>
 * <pre>
 * // 发送简单文本消息
 * WeComBotUtils.sendText("https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx", "Hello World");
 *
 * // 发送文本消息并@所有人
 * WeComBotUtils.sendText("webhook", "通知消息", new String[]{"@all"}, null);
 *
 * // 发送Markdown消息
 * String markdown = "**加粗** \n> 引用\n[链接](https://www.example.com)";
 * WeComBotUtils.sendMarkdown("webhook", markdown);
 * </pre>
 *
 * @author example
 * @since 1.0.0
 */
public class WeComBotUtils {

    private WeComBotUtils() {
        // 工具类，禁止实例化
    }

    /**
     * 发送文本消息
     *
     * @param webhookUrl 群机器人webhook地址
     * @param content    消息内容
     * @return 发送结果，true表示成功
     */
    public static boolean sendText(String webhookUrl, String content) {
        WeComMessageResponse response = WeComGroupBotAdapterImpl.sendTextMessage(webhookUrl, content);
        return response != null && response.isSuccess();
    }

    /**
     * 发送文本消息（支持@成员）
     *
     * @param webhookUrl         群机器人webhook地址
     * @param content            消息内容
     * @param mentionedList      @成员的用户ID列表，如 ["@all"] 表示@所有人
     * @param mentionedMobileList @成员的手机号列表
     * @return 发送结果，true表示成功
     */
    public static boolean sendText(String webhookUrl, String content,
                                   String[] mentionedList, String[] mentionedMobileList) {
        WeComGroupBotAdapterImpl adapter = WeComGroupBotAdapterImpl.getInstance();
        if (adapter == null) {
            return false;
        }
        WeComMessageResponse response = adapter.sendText(webhookUrl, content, mentionedList, mentionedMobileList);
        return response != null && response.isSuccess();
    }

    /**
     * 发送Markdown消息
     *
     * @param webhookUrl 群机器人webhook地址
     * @param content    Markdown格式的消息内容
     * @return 发送结果，true表示成功
     */
    public static boolean sendMarkdown(String webhookUrl, String content) {
        WeComMessageResponse response = WeComGroupBotAdapterImpl.sendMarkdownMessage(webhookUrl, content);
        return response != null && response.isSuccess();
    }

    /**
     * 发送图文消息
     *
     * @param webhookUrl 群机器人webhook地址
     * @param message    自定义消息对象
     * @return 发送结果，true表示成功
     */
    public static boolean sendMessage(String webhookUrl, WeComMessage message) {
        WeComMessageResponse response = WeComGroupBotAdapterImpl.sendWeComMessage(webhookUrl, message);
        return response != null && response.isSuccess();
    }

    /**
     * 发送带返回值的文本消息
     *
     * @param webhookUrl 群机器人webhook地址
     * @param content    消息内容
     * @return 响应对象，包含错误码和错误信息
     */
    public static WeComMessageResponse sendTextWithResponse(String webhookUrl, String content) {
        return WeComGroupBotAdapterImpl.sendTextMessage(webhookUrl, content);
    }

    /**
     * 发送带返回值的Markdown消息
     *
     * @param webhookUrl 群机器人webhook地址
     * @param content    Markdown内容
     * @return 响应对象，包含错误码和错误信息
     */
    public static WeComMessageResponse sendMarkdownWithResponse(String webhookUrl, String content) {
        return WeComGroupBotAdapterImpl.sendMarkdownMessage(webhookUrl, content);
    }
}
