import { analyzeMarkdown } from './markdown.mjs';
export const categories = ['3D 디자인', '개발 기록', 'AI 실험', '프로젝트'];

export function plainText(markdown = '') {
  return analyzeMarkdown(markdown).text;
}
export function summary(body = '', description = '') {
  const text = plainText(description || body);
  return text.length > 145 ? text.slice(0, 145).trimEnd() + '…' : text;
}
export function readingMinutes(body = '') {
  return Math.max(1, Math.ceil(plainText(body).length / 650));
}
export function stableSlug(id) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/.test(id)) throw new Error('글 ID는 영문·숫자·하이픈·밑줄만 사용할 수 있습니다.');
  return id;
}
export function isPublished(post) { return post.published === true; }
export function normalizeBase(base = '/') { return '/' + base.split('/').filter(Boolean).join('/') + (base.split('/').filter(Boolean).length ? '/' : ''); }
export function localPath(path, base = '/') {
  if (/^(?:https?:)?\/\//i.test(path)) return path;
  const normalized = normalizeBase(base);
  if (normalized !== '/' && path.startsWith(normalized)) return path;
  return normalized + path.replace(/^\/+/, '');
}
export function validatePost(data, body, filename) {
  const errors = [];
  try { stableSlug(data.id || ''); } catch { errors.push('고정 ID가 올바르지 않습니다.'); }
  if (!data.title?.trim()) errors.push('제목이 필요합니다.');
  if (!categories.includes(data.category)) errors.push('카테고리가 올바르지 않습니다.');
  if (!data.date || Number.isNaN(new Date(data.date).getTime())) errors.push('작성일이 필요합니다.');
  if (typeof data.published !== 'boolean') errors.push('공개 상태는 true 또는 false여야 합니다.');
  if (data.published && !analyzeMarkdown(body).hasContent) errors.push('공개할 글의 본문이 비어 있습니다.');
  if (data.cover && !data.cover.startsWith('/uploads/')) errors.push('대표 이미지는 미디어 보관함에 업로드해 주세요.');
  if (data.cover && !data.coverAlt?.trim()) errors.push('대표 이미지 설명을 입력해 주세요.');
  return errors.map((error) => `${filename}: ${error}`);
}
