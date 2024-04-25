import { defineStore } from "pinia";
import { SpaceItemType, SpaceType, ResultType } from "@/types/space";
import { pathReg } from "@/constants/regExp";
import { get } from "lodash";

/**
 * 空间状态（类似文件系统实现）
 */
export const useSpaceStore = defineStore("space", {
  state: () => ({
    // 扁平化存储空间
    space: {
      // 默认包含根目录
      "/": {
        name: "/",
        dir: "/",
        type: "dir",
      },
    } as SpaceType,
    // 当前所在目录
    currentDir: "/",
  }),
  getters: {},
  actions: {
    /**
     * 获取单条目
     * @param key
     */
    getItem(key: string) {
      const fullPath = getFullPath(this.currentDir, key);
      return this.space[fullPath];
    },
    /**
     * 获取某目录下的条目
     * @param dir 目录
     * @param recursive 是否递归
     */
    listItems(dir?: string, recursive = false): SpaceItemType[] {
      if (!dir) {
        dir = this.currentDir;
      } else {
        dir = getFullPath(this.currentDir, dir);
      }
      const resultList: SpaceItemType[] = [];
      // 父目录层级
      const parentDirDepth = getItemDepth(dir);
      // 查询 dir 下的 item
      for (const key in this.space) {
        // 不列举自身
        if (key === dir) {
          continue;
        }
        // 前缀必须匹配
        if (!key.startsWith(dir)) {
          continue;
        }
        // 不递归，只展示直接子级
        if (!recursive) {
          // 直接子级的 '/' 数比父级多 1
          if (getItemDepth(key) - 1 === parentDirDepth) {
            resultList.push(this.space[key]);
          }
        } else {
          // 将所有子级都展示
          resultList.push(this.space[key]);
        }
      }
      return resultList;
    },
    /**
     * 添加条目
     * @param item
     */
    addItem(item: SpaceItemType): ResultType {
      const fullPath = getFullPath(item.dir, item.name);
      // 非法路径
      if (!pathReg.test(fullPath)) {
        return {
          result: false,
          message: "路径不合法",
        };
      }
      // 目录不存在
      if (!this.space[item.dir]) {
        return {
          result: false,
          message: "目录不存在",
        };
      }
      if (this.space[fullPath]) {
        return {
          result: false,
          message: "文件已存在",
        };
      }
      this.space[fullPath] = item;
      return {
        result: true,
      };
    },
    /**
     * 删除条目
     * @param key
     * @param recursive
     */
    deleteItem(key: string, recursive = false): ResultType {
      const fullPath = getFullPath(this.currentDir, key);
      // 非法路径
      if (!pathReg.test(fullPath)) {
        return {
          result: false,
          message: "路径不合法",
        };
      }
      // 目录不存在
      if (!this.space[fullPath]) {
        return {
          result: false,
          message: "目录/文件不存在",
        };
      }
      const deleteKeyList = [fullPath];
      // 需要递归删除
      if (recursive) {
        for (const spaceKey in this.space) {
          if (spaceKey.startsWith(fullPath)) {
            deleteKeyList.push(spaceKey);
          }
        }
      }
      // 移除属性
      deleteKeyList.forEach((deleteKey) => {
        delete this.space[deleteKey];
      });
      return {
        result: true,
      };
    },
    /**
     * 递归复制目录
     */
    copyDirectory(sourcePath: string, targetPath: string): ResultType {
      // console.log("sourcePath", sourcePath, "targetPath", targetPath);

      const items = this.listItems(sourcePath, true);
      // console.log("items", items);
      const itemName = getItemName(sourcePath);
      const newDirPath = targetPath + itemName;
      if (!this.space[newDirPath]) {
        this.addItem({
          dir: targetPath,
          name: itemName,
          type: "dir",
        });
      }
      for (const item of items) {
        // 计算在目标目录中的路径
        const targetItemPath = targetPath + itemName + "/" + item.name;
        // console.log("targetItemPath", targetItemPath);

        // 如果这一项是一个目录，则递归调用 copyDirectory
        if (item.type === "dir") {
          this.copyDirectory(item.dir, targetItemPath);
        } else {
          // 否则，直接复制这一项
          this.space[targetItemPath] = { ...item, dir: targetPath + itemName };
        }
      }
      return {
        result: true,
      };
    },
    updateItem(dir: string, name: string, link: string): ResultType {
      const fullPath = getFullPath(this.currentDir, dir);
      // 非法路径
      if (!pathReg.test(fullPath)) {
        return {
          result: false,
          message: "路径不合法",
        };
      }
      // 目录不存在
      if (!this.space[fullPath]) {
        return {
          result: false,
          message: "目录不存在",
        };
      }
      this.space[fullPath] = {
        ...this.space[fullPath],
        name,
        link,
      };
      return {
        result: true,
      };
    },

    /**
     * 复制条目
     * @param source
     * @param target
     * @param recursive
     * 需要注意的是，复制的文件或目录以原目录或文件名命名
     */
    copyItem(source: string, target: string, recursive = false): ResultType {
      // e.g. /a/b => /a/c
      const sourceFullPath = getFullPath(this.currentDir, source);
      const targetFullPath = getFullPath(this.currentDir, target);
      // 非法路径
      if (!pathReg.test(sourceFullPath) || !pathReg.test(targetFullPath)) {
        return {
          result: false,
          message: "存在非法路径",
        };
      }
      // 源条目不存在
      const sourceItem = this.space[sourceFullPath];
      if (!sourceItem) {
        return {
          result: false,
          message: "源条目不存在",
        };
      }
      // 复制目录必须开启递归
      if (sourceItem.type === "dir" && !recursive) {
        return {
          result: false,
          message: "目录复制必须开启递归",
        };
      }

      // 目标条目已存在
      const tempPath = targetFullPath + "/" + getItemName(sourceFullPath);
      if (this.space[tempPath]) {
        return {
          result: false,
          message: "目标文件已存在",
        };
      }
      // 目标目录不存在
      if (!this.space[targetFullPath]) {
        return {
          result: false,
          message: "目标目录不存在",
        };
      }
      if (sourceItem.type === "dir" && recursive) {
        return this.copyDirectory(sourceFullPath, targetFullPath);
      }

      const targetItem = { ...sourceItem };
      targetItem.dir = targetFullPath;
      targetItem.name = getItemName(sourceFullPath);
      return this.addItem(targetItem);
    },
    /**
     * 移动条目（等同于复制 + 删除）
     * @param source
     * @param target
     * @param recursive
     */
    moveItem(source: string, target: string, recursive = false): ResultType {
      let result = this.copyItem(source, target, recursive);
      if (result) {
        result = this.deleteItem(source, recursive);
      }
      return result;
    },
    /**
     * 更新当前所在目录
     * @param newDir
     */
    updateCurrentDir(newDir: string): ResultType {
      let fullPath = getFullPath(this.currentDir, newDir);
      // console.log("fullPath", fullPath);

      // 非法路径
      if (!pathReg.test(fullPath)) {
        return {
          result: false,
          message: "路径不合法",
        };
      }
      // 上层目录
      if (newDir === "../") {
        // 已经是根目录，无法到上层
        if (this.currentDir === "/") {
          return {
            result: false,
            message: "已经是根目录",
          };
        } else {
          fullPath = getParentDir(this.currentDir);
        }
      }
      // 目录不存在
      if (!this.space[fullPath] || this.space[fullPath].type !== "dir") {
        // 尝试将最后的斜杠去掉
        const temp = fullPath.slice(0, -1);
        if (this.space[temp]) {
          this.currentDir = temp;
          return {
            result: true,
          };
        }
        return {
          result: false,
          message: "目录不存在",
        };
      }
      this.currentDir = fullPath;
      return {
        result: true,
      };
    },
    /**
     * 路径补全
     */
    autoCompletePath(path: string): string {
      // 根据当前路径(默认)以及用户输入的部分路径进行补全
      // e.g. ./createDir/zhi  => ./createDir/zhihu
      // e.g. ./crea  => ./createDir
      // e.g. ../zhi  => ../zhihu
      // e.g. zhi  => ./zhihu
      let index = path.lastIndexOf("/") + 1;
      if (index === 0) {
        // 处理e.g createDir => ./createDir
        path = "./" + path;
        index = 2;
      }
      const prePath = path.substring(0, index);
      const nxtPath = path.substring(index);
      // 调用 getFullPath 处理./ ../
      const tempName = getFullPath(this.currentDir, prePath);
      // 拼接可能的路径前缀
      const result = Object.keys(this.space).filter((key) =>
        key.startsWith(tempName + nxtPath)
      )[0];
      if (result) {
        //返回用户输入的部分路径
        return prePath + result.substring(tempName.length);
      }
      return "";
    },
  },
  // 持久化(默认是存储到loacalStorage)
  persist: {
    key: "space-store",
    beforeRestore: (context) => {
      console.log("load spaceStore data start");
    },
    afterRestore: (context) => {
      console.log("load spaceStore data end");
    },
  },
});

/**
 * 获得条目绝对路径
 * @param dir 目录
 * @param name 条目名称（位置）
 */
const getFullPath = (dir: string, name: string): string => {
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

/**
 * 获取上层路径
 * @param path
 */
const getParentDir = (path: string): string => {
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

/**
 * 根据路径获取空间条目名
 * @param path
 */
const getItemName = (path: string): string => {
  if (path === "/") {
    return path;
  }
  // 从最后一个 '/' 开始取字符串
  // e.g. /a/b => b
  return path.substring(path.lastIndexOf("/") + 1);
};

/**
 * 获得条目层级
 * @param key
 */
const getItemDepth = (key: string) => {
  if (key === "/") {
    return 1;
  }
  return key.split("/").length;
};
