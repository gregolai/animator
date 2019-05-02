import isFunction from 'lodash/isFunction';
import uid from 'uid';

/**
 * @param {Array<object>} list
 * @param {Function|string} id
 */
const getOne = (list, id) => {
  const index = list.findIndex(isFunction(id) ? id : item => item.id === id);
  return {
    index,
    item: list[index] || null
  };
};

/**
 * @param {Array<object>} list
 * @param {Function|Array<string>} ids
 */
const getMany = (list, ids) => {
  const indices = [];
  const items = [];

  const filterFn = isFunction(ids) ? ids : item => ids.indexOf(item.id) !== -1;

  for (let i = 0; i < list.length; ++i) {
    if (filterFn(list[i], i, list)) {
      indices.push(i);
      items.push(list[i]);
    }
  }
  return { indices, items };
};

const db = {
  /**
   * @param {Array<object>} list
   * @param {object} value
   * @param {boolean} mutateList
   */
  createOne: (list, value, mutateList = false) => {
    if (!mutateList) {
      list = [...list];
    }

    const item = {
      id: uid(8),
      ...value
    };
    const index = list.length;
    list.push(item);
    return { list, item, index };
  },

  /**
   * @param {Array<object>} list
   * @param {Array<object>} values
   * @param {boolean} mutateList
   */
  createMany: (list, values, mutateList = false) => {
    if (!mutateList) {
      list = [...list];
    }

    const items = [];
    const indices = [];

    values.forEach(value => {
      const { item, index } = db.createOne(
        list,
        {
          id: uid(8),
          ...value
        },
        true
      );
      items.push(item);
      indices.push(index);
    });

    return { list, items, indices };
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
   * @param {object} value
   * @param {boolean} mutateList
   */
  setOne: (list, id, value, mutateList = false) => {
    if (!mutateList) {
      list = [...list];
    }

    const { index, item } = getOne(list, id);
    if (item) {
      list[index] = {
        ...item,
        ...value,
        id: item.id // retain the id
      };
    }

    return { list, index, item };
  },

  /**
   * @param {Array<object>} list
   * @param {Function|Array<string>} ids
   * @param {object} value
   * @param {boolean} mutateList
   */
  setMany: (list, ids, value, mutateList = false) => {
    if (!mutateList) {
      list = [...list];
    }

    const { indices, items } = getMany(list, ids);
    for (let i = 0; i < indices.length; ++i) {
      const index = indices[i];
      const item = items[i];
      list[index] = {
        ...item,
        ...value,
        id: item.id // retain the id
      };
    }

    return { list, indices, items };
  },

  /**
   * @param {Array<object>} list
   * @param {Function|string} id
   * @param {boolean} mutateList
   */
  deleteOne: (list, id, mutateList) => {
    if (!mutateList) {
      list = [...list];
    }

    const { item, index } = getOne(list, id);
    if (item) {
      list.splice(index, 1);
    }
    return { list, item, index };
  },

  /**
   * @param {Array<object>} list
   * @param {Function|Array<string>} ids
   * @param {boolean} mutateList
   */
  deleteMany: (list, ids, mutateList = false) => {
    if (!mutateList) {
      list = [...list];
    }

    const { items, indices } = getMany(list, ids);

    // splice backwards because length changes
    for (let i = indices.length - 1; i >= 0; --i) {
      list.splice(indices[i], 1);
    }

    return { list, items, indices };
  }
};

export default db;

// class TableSideEffects {

//   _listeners = {};

//   _register(key, fn) {
//     let list = this._listeners[key];
//     if (!list) {
//       list = this._listeners[key] = [];
//     }
//     list.push(fn);
//   }

//   _trigger(key, data) {
//     const { items, indices } = this._normalizeItems(data)
//     if (items.length === 0) return;

//     let list = this._listeners[key];
//     if (list) {
//       list.forEach(cb => cb({ items, indices }));
//     }
//   }

//   _normalizeItems({ item, index, items, indices }) {
//     if (!items) {
//       items = item ? [item] : [];
//       indices = item ? [index] : [];
//     }
//     return { items, indices };
//   }

//   create(cb) {
//     if (isFunction(cb)) {
//       this._register('create', cb);
//     } else {
//       this._trigger('create', cb);
//     }
//   }

//   set(cb) {
//     if (isFunction(cb)) {
//       this._register('set', cb);
//     } else {
//       this._trigger('set', cb);
//     }
//   }

//   delete(cb) {
//     if (isFunction(cb)) {
//       this._register('delete', cb);
//     } else {
//       this._trigger('delete', cb);
//     }
//   }
// }

// class TableTransactionHelper {

//   _transaction = null;

//   isActive() {
//     return this._transaction !== null;
//   }

//   start(transaction) {
//     this._transaction = transaction;
//   }

//   commit() {

//   }

//   rollback() {

//   }
// }

// class Table {
//   _list = [];

//   on = new TableSideEffects();

//   transaction = new TableTransactionHelper();

//   createOne(value) {
//     const { item, index } = db.createOne(this._list, value, true);
//     this.on.create({ item, index });
//   }

//   getOne(id) {
//     const { item, index } = db.getOne(this._list, id);
//   }

//   getMany(ids) {
//     const { items, indices } = db.getMany(this._list, ids);
//   }

//   setOne(id, value) {
//     const { item, index } = db.setOne(this._list, id, value, true);
//     this.on.set({ item, index });
//   }

//   deleteOne(id) {
//     const { item, index } = db.deleteOne(this._list, id, true);
//     this.on.delete({ item, index });
//   }

//   deleteMany(ids) {
//     const { items, indices } = db.deleteMany(this._list, ids, true);
//     this.on.delete({ items, indices });
//   }
// }

// class Transaction {
//   create(cbList) {
//     // TODO
//   }
// }
