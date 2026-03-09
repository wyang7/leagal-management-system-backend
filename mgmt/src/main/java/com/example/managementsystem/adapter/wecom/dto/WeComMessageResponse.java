package com.example.managementsystem.adapter.wecom.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * 企业微信消息发送响应DTO
 *
 * @author example
 * @since 1.0.0
 */
@Data
public class WeComMessageResponse {

    /**
     * 错误码，0表示成功
     */
    @JsonProperty("errcode")
    private Integer errCode;

    /**
     * 错误信息
     */
    @JsonProperty("errmsg")
    private String errMsg;

    /**
     * 判断是否发送成功
     *
     * @return true表示成功，false表示失败
     */
    public boolean isSuccess() {
        return errCode != null && errCode == 0;
    }
}
