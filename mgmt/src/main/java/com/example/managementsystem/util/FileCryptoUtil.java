package com.example.managementsystem.util;

/**
 * 文件加密/解密工具类
 * <p>
 * 使用XOR（异或）加密算法，特点：
 * 1. 加密和解密使用相同的操作（异或运算的自反性：A ^ B ^ B = A）
 * 2. 简单高效，无需额外依赖
 * 3. 加密后的文件无法直接作为图片查看，达到基本的混淆保护效果
 * 4. 不适合高强度加密场景，仅用于防止OSS上直接浏览文件内容
 */
public class FileCryptoUtil {

    /**
     * 加密密钥字节数组
     * 使用固定长度的密钥进行循环异或操作
     * 注意：如需更高安全性，可定期更换此密钥
     */
    private static final byte[] KEY = {
            0x5A, (byte) 0xA5, 0x3C, (byte) 0xC3,
            0x66, (byte) 0x99, 0x12, (byte) 0xED,
            0x7B, (byte) 0x84, 0x45, (byte) 0xBA,
            0x2F, (byte) 0xD0, 0x58, (byte) 0xA7
    };

    /**
     * 加密文件字节数组
     *
     * @param data 原始文件字节数组
     * @return 加密后的字节数组
     */
    public static byte[] encrypt(byte[] data) {
        if (data == null || data.length == 0) {
            return data;
        }
        return xorProcess(data);
    }

    /**
     * 解密文件字节数组
     * <p>
     * 由于XOR的自反性，解密操作与加密操作相同
     *
     * @param data 加密后的字节数组
     * @return 解密后的原始字节数组
     */
    public static byte[] decrypt(byte[] data) {
        if (data == null || data.length == 0) {
            return data;
        }
        return xorProcess(data);
    }

    /**
     * 执行XOR异或处理
     * <p>
     * 原理：将数据每个字节与密钥对应位置字节进行异或运算
     * 密钥循环使用，确保不同长度的数据都能被处理
     *
     * @param data 待处理的数据
     * @return 处理后的数据（新数组，不修改原数组）
     */
    private static byte[] xorProcess(byte[] data) {
        byte[] result = new byte[data.length];
        for (int i = 0; i < data.length; i++) {
            // 使用密钥循环异或
            result[i] = (byte) (data[i] ^ KEY[i % KEY.length]);
        }
        return result;
    }

    /**
     * 批量更新加密密钥（高级功能）
     * <p>
     * 如需定期更换密钥，可调用此方法重新加密所有文件
     * 注意：此操作需要遍历所有文件并重新上传，建议在低峰期执行
     *
     * @param oldKey 旧密钥
     * @param newKey 新密钥
     * @param data   加密数据
     * @return 使用新密钥加密后的数据
     */
    public static byte[] reEncrypt(byte[] oldKey, byte[] newKey, byte[] data) {
        // 先用旧密钥解密
        byte[] decrypted = new byte[data.length];
        for (int i = 0; i < data.length; i++) {
            decrypted[i] = (byte) (data[i] ^ oldKey[i % oldKey.length]);
        }
        // 再用新密钥加密
        byte[] reEncrypted = new byte[decrypted.length];
        for (int i = 0; i < decrypted.length; i++) {
            reEncrypted[i] = (byte) (decrypted[i] ^ newKey[i % newKey.length]);
        }
        return reEncrypted;
    }
}
