const INIT_SPACE = {
  // 扁平化存储空间
  space: {
    // 默认包含根目录
    "/": {
      name: "/",
      dir: "/",
      type: "dir",
    },
  },
  // 当前所在目录
  currentDir: "/",
};

module.exports = {
  INIT_SPACE,
};
