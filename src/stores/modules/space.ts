import { defineStore } from "pinia";
import { SpaceItemType, SpaceType, ResultType } from "@/types/space";
import { pathReg } from "@/constants/regExp";

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
    addItem(item: SpaceItemType): Promise<string> {
      return new Promise((resolve, reject) => {
        const tempDir = item.dir + (item.dir.slice(-1) === "/" ? "" : "/");
        const fullPath = getFullPath(this.currentDir, tempDir + item.name);
        // 因为 addItem 时，dir 可能是相对路径，所以需要重新赋值
        item.dir = getParentDir(fullPath);
        // 非法路径
        if (!pathReg.test(fullPath)) {
          reject(`非法路径：${fullPath}`);
          return;
        }
        // 目录不存在
        if (!this.space[getParentDir(fullPath)]) {
          reject("父目录不存在");
          return;
        }
        if (this.space[fullPath]) {
          reject("目录/文件已存在");
          return;
        }
        this.space[fullPath] = item;
        resolve(fullPath);
      });
    },
    /**
     * 删除条目
     * @param key
     * @param recursive
     */
    deleteItem(key: string, recursive = false): Promise<string> {
      return new Promise((resolve, reject) => {
        const fullPath = getFullPath(this.currentDir, key);
        // 非法路径
        if (!pathReg.test(fullPath)) {
          reject(`非法路径：${fullPath}`);
          return;
        }
        // 目录不存在
        if (!this.space[fullPath]) {
          reject("目录/文件不存在");
          return;
        }
        const deleteKeyList = [fullPath];
        // 需要递归删除
        if (recursive) {
          for (const spaceKey in this.space) {
            console.log("spaceKey", spaceKey);
            // 跳过根目录
            if (spaceKey === "/") {
              continue;
            }
            if (spaceKey.startsWith(fullPath)) {
              deleteKeyList.push(spaceKey);
            }
          }
        }
        // 移除属性
        deleteKeyList.forEach((deleteKey) => {
          delete this.space[deleteKey];
        });
        resolve(JSON.stringify(this.space));
      });
    },
    /**
     * 递归复制目录 copy ./newtest /xxx -r
     */
    copyDirectory(sourcePath: string, targetPath: string): Promise<void> {
      return new Promise((resolve, reject) => {
        const items = this.listItems(sourcePath, true);
        // console.log("items", items);
        // const itemName = getItemName(sourcePath);
        // const newDirPath = targetPath + itemName;
        // if (!this.space[newDirPath]) {
        //   try {
        //     this.addItem({
        //       dir: targetPath,
        //       name: itemName,
        //       type: "dir",
        //     });
        //   } catch (err) {
        //     reject(err);
        //   }
        // }
        for (const item of items) {
          // 计算在目标目录中的路径
          const targetItemPath = targetPath + "/" + item.name;
          // const targetItemPath = targetPath + itemName + "/" + item.name;
          // console.log("targetItemPath", targetItemPath);

          // 如果这一项是一个目录，则递归调用 copyDirectory
          if (item.type === "dir") {
            this.copyDirectory(item.dir, targetItemPath);
          } else {
            // 否则，直接复制这一项
            this.space[targetItemPath] = {
              ...item,
              dir: targetPath,
            };
          }
        }
        return resolve();
      });
    },
    /**
     * 递归更新目录下全部内容
     */
    updateDirectory(oldPath: string, newName: string): ResultType {
      const items = this.listItems(oldPath, true);
      for (const item of items) {
        // 计算在目标目录中的路径
        const tempFullPath = getFullPath(item.dir, item.name);
        const tempArr = item.dir.split("/");
        tempArr[1] = newName;
        item.dir = tempArr.join("/");
        this.addItem({ ...item });
        this.deleteItem(tempFullPath, false);
      }
      return {
        result: true,
      };
    },
    /**
     *
     * 更新条目（先删除原先的，再添加新的）
     * @param dir
     * @param name
     * @param link
     */
    updateItem(dir: string, name: string, link: string): Promise<string> {
      return new Promise((resolve, reject) => {
        const fullPath = getFullPath(this.currentDir, dir);
        // 非法路径
        if (!pathReg.test(fullPath)) {
          reject(`非法路径：${fullPath}`);
          return;
        }
        // 目录不存在
        if (!this.space[fullPath]) {
          reject("目录/文件不存在");
          return;
        }
        if (this.space[fullPath].type === "dir") {
          // 递归更新子目录
          const p1 = this.addItem({
            ...this.space[fullPath],
            name,
          });
          const p2 = this.deleteItem(fullPath, false);
          const p3 = this.updateDirectory(fullPath, name);
          Promise.all([p1, p2, p3])
            .then(() => {
              resolve(fullPath);
            })
            .catch((errMsg) => {
              reject(errMsg);
            });
        } else {
          const newItem = {
            ...this.space[fullPath],
            name,
            link,
          };
          const p2 = this.deleteItem(fullPath, false);
          const p1 = this.addItem(newItem);
          Promise.all([p1, p2])
            .then(() => {
              resolve(fullPath);
            })
            .catch((errMsg) => {
              reject(errMsg);
            });
        }
      });
    },

    /**
     * 复制条目
     * @param source
     * @param target
     * @param recursive
     * 需要注意的是，复制的文件或目录以原目录或文件名命名
     */
    copyItem(
      source: string,
      target: string,
      recursive = false
    ): Promise<string> {
      return new Promise((resolve, reject) => {
        // e.g. /a/b => /a/c
        const sourceFullPath = getFullPath(this.currentDir, source);
        const targetFullPath = getFullPath(this.currentDir, target);
        // 非法路径
        if (!pathReg.test(sourceFullPath)) {
          reject(`非法路径：${sourceFullPath}`);
          return;
        }
        if (!pathReg.test(targetFullPath)) {
          reject(`非法路径：${targetFullPath}`);
          return;
        }
        // 源条目不存在
        const sourceItem = this.space[sourceFullPath];
        if (!sourceItem) {
          reject("原条目不存在");
          return;
        }
        // 复制目录必须开启递归
        if (sourceItem.type === "dir" && !recursive) {
          reject("复制目录必须开启递归");
          return;
        }

        // 目标条目已存在
        const tempPath = targetFullPath + "/" + getItemName(sourceFullPath);
        if (this.space[tempPath]) {
          reject("目标条目已存在");
          return;
        }
        // 目标目录不存在
        if (!this.space[targetFullPath]) {
          reject("目标目录不存在");
          return;
        }
        if (sourceItem.type === "dir" && recursive) {
          this.copyDirectory(sourceFullPath, targetFullPath)
            .then(() => {
              resolve(targetFullPath);
            })
            .catch((errMsg) => {
              reject(errMsg);
            });
          return;
        }

        const targetItem = { ...sourceItem };
        targetItem.dir = targetFullPath;
        targetItem.name = getItemName(sourceFullPath);
        this.addItem(targetItem)
          .then(() => {
            resolve(targetFullPath);
          })
          .catch((errMsg) => {
            reject(errMsg);
          });
      });
    },
    /**
     * 移动条目（等同于复制 + 删除）
     * @param source
     * @param target
     * @param recursive
     */
    moveItem(
      source: string,
      target: string,
      recursive = false
    ): Promise<string> {
      return new Promise((resolve, reject) => {
        const p1 = this.copyItem(source, target, recursive);
        const p2 = this.deleteItem(source, recursive);
        Promise.all([p1, p2])
          .then(() => {
            resolve("移动成功");
          })
          .catch((errMsg) => {
            reject(errMsg);
          });
      });
    },
    /**
     * 更新当前所在目录
     * @param newDir
     */
    updateCurrentDir(newDir: string): Promise<string> {
      return new Promise((resolve, reject) => {
        let fullPath = getFullPath(this.currentDir, newDir);
        // console.log("fullPath", fullPath);

        // 非法路径
        if (!pathReg.test(fullPath)) {
          reject(`非法路径：${fullPath}`);
          return;
        }
        // 上层目录
        if (newDir === "../") {
          // 已经是根目录，无法到上层
          if (this.currentDir === "/") {
            reject("已经是根目录");
            return;
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
            resolve(temp);
          }
          reject("目录不存在");
          return;
        }
        this.currentDir = fullPath;
        resolve(fullPath);
      });
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
 * @param dir 当前目录
 * @param name 条目路径
 */ ("../love");
// ./love baidu
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
