import isFunction from 'lodash/isFunction';
import uid from 'uid';

/**
 * @param {Array<object>} list 
 * @param {Function|string} id 
 */
const getOne = (list, id) => {
  const index = list.findIndex(
    isFunction(id) ?
      id :
      item => item.id === id
  );
  return {
    index,
    item: list[index] || null
  }
}

/**
 * @param {Array<object>} list 
 * @param {Function|Array<string>} ids 
 */
const getMany = (list, ids) => {
  const indices = [];
  const items = [];

  const filterFn = isFunction(ids) ?
    ids :
    item => ids.indexOf(item.id) !== -1;

  for (let i = 0; i < list.length; ++i) {
    if (filterFn(list[i], i, list)) {
      indices.push(i);
      items.push(list[i]);
    }
  }
  return { indices, items };
}

export default {
  /**
   * @param {Array<object>} list 
   * @param {any} value
   * @param {boolean} mutable
   */
  createOne: (list, value, mutable = false) => {
    if (!mutable) {
      list = [...list];
    }

    const item = {
      ...value,
      id: uid(8)
    };
    const index = list.length;

    list.push(item);

    return { list, item, index };
  },

  /**
   * @param {Array<object>} list 
   * @param {Function|string} id
   */
  getOne: (list, id) => {
    const { item, index } = getOne(list, id);
    return { item, index };
  },

  /**
   * @param {Array<object>} list 
   * @param {Function|Array<string>} ids 
   */
  getMany: (list, ids) => {
    const { items, indices } = getMany(list, ids);
    return { items, indices };
  },

  /**
   * @param {Array<object>} list 
   * @param {Function|string} id
   * @param {any} value
   * @param {boolean} mutable
   */
  setOne: (list, id, value, mutable = false) => {
    if (!mutable) {
      list = [...list];
    }

    const { index, item } = getOne(list, id);
    if (item) {
      list[index] = {
        ...item,
        ...value,
        id: item.id
      };
    }

    return { list, index, item };
  },

  /**
   * @param {Array<object>} list 
   * @param {Function|Array<string>} ids 
   * @param {boolean} mutable
   */
  deleteMany: (list, ids, mutable = false) => {
    if (!mutable) {
      list = [...list];
    }

    const { items, indices } = getMany(list, ids);

    // splice backwards because length changes
    for (let i = indices.length - 1; i > 0; --i) {
      list.splice(i, 1);
    }

    return { list, items, indices };
  },

  /**
   * @param {Array<object>} list 
   * @param {Function|string} id
   * @param {boolean} mutable
   */
  deleteOne: (list, id, mutable) => {
    if (!mutable) {
      list = [...list];
    }

    const { item, index } = getOne(list, id);
    if (item) {
      list.splice(index, 1);
    }
    return { list, item, index };
  }

};

