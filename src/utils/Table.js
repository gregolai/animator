import isFunction from 'lodash/isFunction';
import db from './db';

class TableSideEffects {
	_listeners = {};

	_register(key, fn) {
		let list = this._listeners[key];
		if (!list) {
			list = this._listeners[key] = [];
		}
		list.push(fn);
	}

	_trigger(key, data) {
		const { items, indices } = this._normalizeItems(data);
		if (items.length === 0) return;

		let list = this._listeners[key];
		if (list) {
			list.forEach((callback) => callback({ items, indices }));
		}
	}

	_normalizeItems({ item, index, items, indices }) {
		if (!items) {
			items = item ? [item] : [];
			indices = item ? [index] : [];
		}
		return { items, indices };
	}

	clone() {
		const copy = new TableSideEffects();
		copy._listeners = { ...this._listeners };
		return copy;
	}

	create(cb) {
		if (isFunction(cb)) {
			this._register('create', cb);
		} else {
			this._trigger('create', cb);
		}
	}

	set(cb) {
		if (isFunction(cb)) {
			this._register('set', cb);
		} else {
			this._trigger('set', cb);
		}
	}

	delete(cb) {
		if (isFunction(cb)) {
			this._register('delete', cb);
		} else {
			this._trigger('delete', cb);
		}
	}
}

class TableTransactionHelper {
	_transaction = null;

	isActive() {
		return this._transaction !== null;
	}

	start(transaction) {
		this._transaction = transaction;
	}

	commit() {}

	rollback() {}
}

export default class Table {
	_list = [];

	on = new TableSideEffects();

	//transaction = new TableTransactionHelper();

	clone() {
		const copy = new Table();
		copy._list = [...this._list];
		copy.on = this.on.clone();
		return copy;
	}

	createOne(value) {
		const { item, index } = db.createOne(this._list, value, true);
		this.on.create({ item, index });
	}

	getOne(id) {
		const { item, index } = db.getOne(this._list, id);
	}

	getMany(ids) {
		const { items, indices } = db.getMany(this._list, ids);
	}

	setOne(id, value) {
		const { item, index } = db.setOne(this._list, id, value, true);
		this.on.set({ item, index });
	}

	deleteOne(id) {
		const { item, index } = db.deleteOne(this._list, id, true);
		this.on.delete({ item, index });
	}

	deleteMany(ids) {
		const { items, indices } = db.deleteMany(this._list, ids, true);
		this.on.delete({ items, indices });
	}
}

class Transaction {
	create(cbList) {
		// TODO
	}
}
