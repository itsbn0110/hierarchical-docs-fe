import api from "./axios";
import type { SearchResultDto } from "../types/app.types";

/**
 * Lấy các gợi ý tìm kiếm (live search).
 * @param query - Từ khóa người dùng đang gõ.
 * @returns Mảng các kết quả gợi ý.
 */
const getSuggestions = async (query: string): Promise<SearchResultDto[]> => {
  const res = await api.get("/search/suggest", {
    params: { q: query },
  });
  return res.data;
};

/**
 * Thực hiện tìm kiếm toàn văn.
 * @param query - Từ khóa tìm kiếm đầy đủ.
 * @returns Mảng tất cả các kết quả tìm thấy.
 */
const fullSearch = async (query: string): Promise<SearchResultDto[]> => {
  const res = await api.get("/search", {
    params: { q: query },
  });
  return res.data;
};

export const searchApi = {
  getSuggestions,
  fullSearch,
};
