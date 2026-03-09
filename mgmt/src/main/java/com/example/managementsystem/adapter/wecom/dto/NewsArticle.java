package com.example.managementsystem.adapter.wecom.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * 企业微信图文消息文章DTO
 *
 * @author example
 * @since 1.0.0
 */
@Data
public class NewsArticle implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 标题，不超过128个字节
     */
    private String title;

    /**
     * 描述，不超过512个字节
     */
    private String description;

    /**
     * 点击后跳转的链接
     */
    private String url;

    /**
     * 图文消息的图片链接，支持JPG、PNG格式，较好的效果为大图1068*455，小图150*150
     */
    private String picurl;
}
