const getFullPath = (dir, name) => {
  // 需要对name的前缀进行处理例如./ / ../
  // e.g. ./a/b => /a/b   ../../../a/b => /a/b
  if (name.startsWith("/")) {
    return name;
  } else if (name.startsWith("./")) {
    return getFullPath(dir, name.substring(2));
  } else if (name.startsWith("../")) {
    // 如果包含多个../需要递归处理
    return getFullPath(getParentDir(dir), name.substring(3));
  }
  return dir + (dir === "/" ? "" : "/") + name;
};

const getParentDir = (path) => {
  let parentDir = "/";
  if (path === "/") {
    return parentDir;
  }
  // 切割掉最后一个 '/'
  // e.g. /a/b => /a
  parentDir = path.substring(0, path.lastIndexOf("/"));
  // 有可能回退到根目录
  // e.g. /a => ''（空字符串）
  if (!parentDir) {
    return "/";
  }
  return parentDir;
};

function main() {
  // console.log(getFullPath("/", "a/b"));
  // console.log(getFullPath("/", "./a/b"));
  // console.log(getFullPath("/", "../a/b"));
  // console.log(getFullPath("/", "../../a/b"));
  // console.log(getFullPath("/", ""));
  // console.log(getFullPath("/newDir", ""));
  const p = /^(\/|(\/[\w\-]+)+)?$/;
  console.log(p.test("/a/b"));
  console.log(p.test("/a/b/"));
  console.log(p.test("/"));
  console.log(p.test("//"));
}
main();
