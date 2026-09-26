// Small, code-native product illustrations keep catalog rows crisp at any scale.
export default function ProductThumbnail({ product }) {
  const name = product.name.toLowerCase();
  let content;
  if (name.includes('chair')) content = <><rect x="13" y="4" width="17" height="18" rx="4" fill="#8f7662"/><path d="M12 21h21v6H12z" fill="#b18d70"/><path d="M17 26v7m13-7v7M11 15v11m23-11v11M23 33v5m-9 0 9-3 10 3" stroke="#41464c" strokeWidth="2.5" fill="none"/></>;
  else if (name.includes('steel')) content = <><path d="M13 7v29m7-31v31m7-29v29m6-30v30" stroke="#86949c" strokeWidth="5"/><path d="M11 7v29m7-31v31m7-29v29m6-30v30" stroke="#cbd4d7" strokeWidth="1.5"/></>;
  else if (name.includes('cement')) content = <><path d="m10 9 21-3 4 7-1 21-23 4-3-7z" fill="#c1baa5"/><path d="m10 9 20 4 5-1m-5 1v22" stroke="#9b9380" fill="none"/><path d="m12 15 13 2v11l-13-2z" fill="#e1dccd"/><path d="m14 20 8 1m-8 3 6 1" stroke="#aaa18d"/></>;
  else if (name.includes('plank')) content = <><path d="m5 23 23-12 12 7-23 13z" fill="#c18c51"/><path d="m5 23 12 8v6L5 29z" fill="#8c5d35"/><path d="m17 31 23-13v6L17 37z" fill="#ac7743"/><path d="m12 22 18-8m-13 11 18-8m-17 12 17-9" stroke="#d6aa76" strokeWidth="1.3"/></>;
  else content = <><path d="m5 14 23-7 13 8-24 8z" fill="#c8ad8c"/><path d="m5 14 12 9 24-8v4l-24 8L5 18z" fill="#9b7958"/><path d="M8 20v15m10-10v14m20-19v13M29 24v11" stroke="#4c4d4c" strokeWidth="2.5"/></>;
  return <svg className="catalog-illustration" viewBox="0 0 46 44" aria-hidden="true">{content}</svg>;
}
