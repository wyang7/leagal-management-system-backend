package com.example.managementsystem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:你的前端端口") // 前端页面的地址，不要用*
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowCredentials(true) // 关键：允许携带cookie
                .maxAge(3600);
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        // 允许所有域名跨域访问（开发环境用，生产环境需指定具体域名）
        config.addAllowedOriginPattern("*");
        // 允许携带Cookie
        config.setAllowCredentials(true);
        // 允许所有请求方法（GET/POST/PUT/DELETE等）
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        // 允许所有请求头
        config.addAllowedHeader("*");
        // 允许暴露响应头（方便前端获取自定义头信息）
        config.addExposedHeader("*");
        // 设置预检请求的有效期（避免频繁预检请求）
        config.setMaxAge(3600L);

        // 应用到所有接口
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
