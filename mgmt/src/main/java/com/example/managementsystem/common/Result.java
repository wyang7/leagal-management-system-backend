package com.example.managementsystem.common;

import lombok.Data;

import java.io.Serializable;

/**
 * 统一响应结果类
 */
@Data
public class Result<T> implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 成功标志
     */
    private boolean success;

    /**
     * 消息
     */
    private String message;

    /**
     * 状态码
     */
    private int code;

    /**
     * 结果对象
     */
    private T data;

    public Result() {
    }

    public Result(boolean success, String message, int code, T data) {
        this.success = success;
        this.message = message;
        this.code = code;
        this.data = data;
    }

    /**
     * 成功返回
     */
    public static <T> Result<T> success() {
        return new Result<>(true, "操作成功", 200, null);
    }

    /**
     * 成功返回带数据
     */
    public static <T> Result<T> success(T data) {
        return new Result<>(true, "操作成功", 200, data);
    }

    /**
     * 失败返回
     */
    public static <T> Result<T> fail(String message) {
        return new Result<>(false, message, 500, null);
    }

    /**
     * 失败返回带状态码
     */
    public static <T> Result<T> fail(int code, String message) {
        return new Result<>(false, message, code, null);
    }
}
