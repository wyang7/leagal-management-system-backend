package com.example.managementsystem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * RestTemplate配置类
 *
 * @author example
 * @since 1.0.0
 */
@Configuration
public class RestTemplateConfig {

    /**
     * 连接超时时间（毫秒）
     */
    private static final int CONNECT_TIMEOUT = 5000;

    /**
     * 读取超时时间（毫秒）
     */
    private static final int READ_TIMEOUT = 10000;

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(CONNECT_TIMEOUT);
        factory.setReadTimeout(READ_TIMEOUT);
        return new RestTemplate(factory);
    }
}
