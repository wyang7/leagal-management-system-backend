package com.example.managementsystem.adapter.wecom.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 企业微信群机器人消息DTO
 * 支持多种消息类型：text、markdown、image、news、file、voice、template_card
 *
 * @author example
 * @since 1.0.0
 */
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WeComMessage implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 消息类型
     */
    @JsonProperty("msgtype")
    private String msgType;

    /**
     * 文本消息
     */
    private TextMessage text;

    /**
     * Markdown消息
     */
    private MarkdownMessage markdown;

    /**
     * 图片消息
     */
    private ImageMessage image;

    /**
     * 图文消息
     */
    private NewsMessage news;

    /**
     * 文件消息
     */
    private FileMessage file;

    /**
     * 语音消息
     */
    private VoiceMessage voice;

    /**
     * 创建文本消息
     *
     * @param content 消息内容
     * @return 文本消息对象
     */
    public static WeComMessage createText(String content) {
        WeComMessage message = new WeComMessage();
        message.setMsgType("text");
        TextMessage text = new TextMessage();
        text.setContent(content);
        message.setText(text);
        return message;
    }

    /**
     * 创建文本消息（支持@成员）
     *
     * @param content             消息内容
     * @param mentionedList       @成员的用户ID列表
     * @param mentionedMobileList @成员的手机号列表
     * @return 文本消息对象
     */
    public static WeComMessage createText(String content, List<String> mentionedList, List<String> mentionedMobileList) {
        WeComMessage message = new WeComMessage();
        message.setMsgType("text");
        TextMessage text = new TextMessage();
        text.setContent(content);
        text.setMentionedList(mentionedList);
        text.setMentionedMobileList(mentionedMobileList);
        message.setText(text);
        return message;
    }

    /**
     * 创建Markdown消息
     *
     * @param content Markdown内容
     * @return Markdown消息对象
     */
    public static WeComMessage createMarkdown(String content) {
        WeComMessage message = new WeComMessage();
        message.setMsgType("markdown");
        MarkdownMessage markdown = new MarkdownMessage();
        markdown.setContent(content);
        message.setMarkdown(markdown);
        return message;
    }

    /**
     * 创建图片消息
     *
     * @param base64 图片内容的base64编码
     * @param md5    图片内容的md5值
     * @return 图片消息对象
     */
    public static WeComMessage createImage(String base64, String md5) {
        WeComMessage message = new WeComMessage();
        message.setMsgType("image");
        ImageMessage image = new ImageMessage();
        image.setBase64(base64);
        image.setMd5(md5);
        message.setImage(image);
        return message;
    }

    /**
     * 创建图文消息
     *
     * @param articles 图文消息列表
     * @return 图文消息对象
     */
    public static WeComMessage createNews(List<NewsArticle> articles) {
        WeComMessage message = new WeComMessage();
        message.setMsgType("news");
        NewsMessage news = new NewsMessage();
        news.setArticles(articles);
        message.setNews(news);
        return message;
    }

    /**
     * 创建文件消息
     *
     * @param mediaId 文件media_id
     * @return 文件消息对象
     */
    public static WeComMessage createFile(String mediaId) {
        WeComMessage message = new WeComMessage();
        message.setMsgType("file");
        FileMessage file = new FileMessage();
        file.setMediaId(mediaId);
        message.setFile(file);
        return message;
    }

    /**
     * 创建语音消息
     *
     * @param mediaId 语音media_id
     * @return 语音消息对象
     */
    public static WeComMessage createVoice(String mediaId) {
        WeComMessage message = new WeComMessage();
        message.setMsgType("voice");
        VoiceMessage voice = new VoiceMessage();
        voice.setMediaId(mediaId);
        message.setVoice(voice);
        return message;
    }

    /**
     * 文本消息内部类
     */
    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TextMessage implements Serializable {
        private static final long serialVersionUID = 1L;

        /**
         * 消息内容，最长不超过2048个字节（约680个汉字）
         */
        private String content;

        /**
         * @成员的用户ID列表，@all表示@所有人
         */
        @JsonProperty("mentioned_list")
        private List<String> mentionedList;

        /**
         * @成员的手机号列表
         */
        @JsonProperty("mentioned_mobile_list")
        private List<String> mentionedMobileList;
    }

    /**
     * Markdown消息内部类
     */
    @Data
    public static class MarkdownMessage implements Serializable {
        private static final long serialVersionUID = 1L;

        /**
         * Markdown内容，最长不超过4096个字节（约1365个汉字）
         */
        private String content;
    }

    /**
     * 图片消息内部类
     */
    @Data
    public static class ImageMessage implements Serializable {
        private static final long serialVersionUID = 1L;

        /**
         * 图片内容的base64编码
         */
        @JsonProperty("base64")
        private String base64;

        /**
         * 图片内容的md5值
         */
        @JsonProperty("md5")
        private String md5;
    }

    /**
     * 图文消息内部类
     */
    @Data
    public static class NewsMessage implements Serializable {
        private static final long serialVersionUID = 1L;

        /**
         * 图文消息列表
         */
        private List<NewsArticle> articles;
    }

    /**
     * 文件消息内部类
     */
    @Data
    public static class FileMessage implements Serializable {
        private static final long serialVersionUID = 1L;

        /**
         * 文件media_id
         */
        @JsonProperty("media_id")
        private String mediaId;
    }

    /**
     * 语音消息内部类
     */
    @Data
    public static class VoiceMessage implements Serializable {
        private static final long serialVersionUID = 1L;

        /**
         * 语音media_id
         */
        @JsonProperty("media_id")
        private String mediaId;
    }
}
