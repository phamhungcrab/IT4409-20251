import { useState, useCallback } from 'react';
import apiClient from '../utils/apiClient';
import { AxiosRequestConfig } from 'axios';

/** Chưa dùng do đang sử dụng kiến trúc services
 * UseApiResponse<T> là “kiểu dữ liệu trả về” của hook useApi.
 *
 * T là kiểu dữ liệu mà API trả về (generic).
 * Ví dụ:
 * - useApi<UserDto[]>()  => data là UserDto[] | null
 * - useApi<ResultDetail>() => data là ResultDetail | null
 */
interface UseApiResponse<T> {
  data: T | null;                 // dữ liệu lấy được từ API (hoặc null nếu chưa có/ lỗi)
  loading: boolean;               // trạng thái đang gọi API hay không
  error: string | null;           // thông báo lỗi (nếu có)
  execute: (config: AxiosRequestConfig) => Promise<T | null>; // hàm thực thi request
}

/**
 * useApi<T> là custom hook để gọi API theo kiểu “tái sử dụng”.
 *
 * Ý tưởng:
 * - Thay vì mỗi trang tự viết useState(data/loading/error) + try/catch,
 *   ta gom lại thành một hook chung.
 *
 * Cách dùng:
 * const { data, loading, error, execute } = useApi<UserDto[]>();
 * useEffect(() => { execute({ method:'GET', url:'/api/User/get-all' }) }, [])
 */

export const useApi = <T = any>(): UseApiResponse<T> => {
  // data: kết quả API trả về
  const [data, setData] = useState<T | null>(null);

  // loading: bật khi bắt đầu request, tắt khi xong (thành công hoặc lỗi)
  const [loading, setLoading] = useState(false);

  // error: chứa message lỗi để UI hiển thị
  const [error, setError] = useState<string | null>(null);

  /**
   * execute là hàm gọi API.
   *
   * useCallback giúp “ghi nhớ” function này, không tạo function mới mỗi lần render.
   * Điều này hữu ích khi:
   * - bạn truyền execute xuống component con
   * - hoặc đưa execute vào dependency của useEffect
   * để tránh effect chạy lại do function thay đổi reference.
   */
  const execute = useCallback(async (config: AxiosRequestConfig) => {
    setLoading(true);
    setError(null);

    try {
      /**
       * apiClient(config):
       * - apiClient là instance axios (đã cấu hình baseURL + interceptor)
       * - truyền vào config gồm: method, url, data, params, headers...
       *
       * Ví dụ config:
       * { method: 'GET', url: '/api/Exam/get-all' }
       * { method: 'POST', url: '/api/Auth/login', data: {...} }
       */
      const response = await apiClient(config);

      /**
       * CỰC KỲ QUAN TRỌNG:
       * - Với axios thuần: response là AxiosResponse => có response.data
       * - Nhưng trong dự án của bạn, apiClient interceptor “unwrap” và thường RETURN RA data luôn.
       *   Nghĩa là response có thể chính là data (không có .data).
       *
       * Vì vậy, nếu interceptor của bạn đang return result.data,
       * thì setData(response.data) sẽ bị sai (undefined).
       *
       * Dưới đây là cách an toàn:
       * - Nếu response có field data -> lấy response.data
       * - Nếu không -> coi response chính là data
       */
      const payload = (response && typeof response === 'object' && 'data' in (response as any))
        ? (response as any).data
        : (response as any);

      setData(payload as T);
      return payload as T;
    } catch (err: any) {
      /**
       * Khi axios lỗi, err thường có dạng:
       * - err.response: chứa status + data từ server
       * - err.message: message chung (network error, timeout,...)
       *
       * Dòng dưới: ưu tiên message từ server -> fallback sang message mặc định.
       */
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Có lỗi xảy ra khi gọi API';

      setError(message);
      return null;
    } finally {
      // finally luôn chạy dù success hay fail => đảm bảo loading tắt
      setLoading(false);
    }
  }, []);

  // Trả về các state + hàm execute để component khác dùng
  return { data, loading, error, execute };
};
