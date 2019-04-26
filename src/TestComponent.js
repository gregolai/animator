import React from 'react';
import noop from 'lodash/noop';
import { createPersist } from 'utils/persist';
import db from 'utils/db';

class Command {
  constructor(executeFn, undoFn) {
    this._execute = executeFn;
    this._undo = undoFn;
  }
  execute() {
    this.data = this._execute(this.data);
  }
  undo() {
    this.data = this._undo(this.data);
  }
}

const createCRUD = ({ onCreate = noop, onUpdate = noop, onDelete = noop }) => {
  const CREATE = 'create';
  const UPDATE = 'update';
  const DELETE = 'delete';

  const listeners = {};
  const register = (key, fn) => {
    let li = listeners[key];
    if (!li) {
      li = listeners[key] = [];
    }
    li.push(fn);
  };

  const trigger = (key, { list, items, indices }) => {
    if (!items || items.length === 0) return;

    const li = listeners[key];
    if (li) {
      li.forEach(cb => cb({ list, items, indices }));
    }
  };

  const createPayload = res => {
    const list = res.list;
    const items = res.items || [res.item];
    const indices = res.indices || [res.index];
    return { list, items, indices };
  };

  register(CREATE, onCreate);
  register(UPDATE, onUpdate);
  register(DELETE, onDelete);

  return {
    createOne: (list, value) => {
      const res = db.createOne(list, value);
      if (res.item) {
        trigger(CREATE, createPayload(res));
      }
      return res.item;
    },
    getOne: (list, id) => db.getOne(list, id).item,
    getMany: (list, ids) => db.getMany(list, ids).items,
    setOne: (list, id, value) => {
      const res = db.setOne(list, id, value);
      if (res.item) {
        trigger(UPDATE, createPayload(res));
      }
      return res.item;
    },
    deleteOne: (list, id) => {
      const res = db.deleteOne(list, id);
      if (res.item) {
        trigger(DELETE, createPayload(res));
      }
      return res.item;
    },
    deleteMany: (list, ids) => {
      const res = db.deleteMany(list, ids);
      if (res.items.length > 0) {
        trigger(DELETE, createPayload(res));
      }
      return res.items;
    }
  };
};

const persist = createPersist('SampleStore', {
  animations: [],
  instances: [],
  keyframes: [],
  tweens: []
});

const Anim = ({ anim }) => <div>Anim #{anim.id}</div>;

const Tween = ({ tween }) => (
  <div>
    Tween #{tween.id} - anim ${tween.animId}
  </div>
);

export default class TestComponent extends React.Component {
  undoStack = [];
  undoPointer = 0;

  constructor(props) {
    super(props);

    const animations = persist.animations.read();
    const tweens = persist.animations.read();

    this.CRUD = {
      animations: createCRUD({
        onCreate: ({ list }) => {
          this.setState({ animations: list });
          persist.animations.write(list);
        },
        onUpdate: ({ list }) => {
          this.setState({ animations: list });
          persist.animations.write(list);
        },
        onDelete: ({ list, items: deleted }) => {
          deleted.forEach(anim => {
            this.CRUD.tweens.deleteMany(
              this.state.tweens,
              t => t.animId === anim
            );
          });

          this.setState({ animations: list });
          persist.animations.write(list);
        }
      }),
      tweens: createCRUD({
        onCreate: ({ list }) => {
          this.setState({ tweens: list });
          persist.tweens.write(list);
        },
        onUpdate: ({ list }) => {
          this.setState({ tweens: list });
          persist.tweens.write(list);
        },
        onDelete: ({ list }) => {
          this.setState({ tweens: list });
          persist.tweens.write(list);
        }
      })
    };

    this.state = { animations, tweens };
  }

  componentDidMount() {
    document.addEventListener('keydown', e => {
      const getRandomAnim = () => {
        const list = this.CRUD.animations.getMany();
        return list.length > 0
          ? list[Math.floor(Math.random() * list.length)]
          : undefined;
      };

      if (e.code === 'KeyZ' && e.metaKey) {
        const cmd = this.undoStack[this.undoPointer - 1];

        if (cmd) {
          if (e.shiftKey) {
            // redo
            cmd.execute();
            this.undoPointer++;
          } else {
            // undo
            cmd.undo();
            this.undoPointer--;
          }
        }
      }

      if (e.code === 'KeyE') {
        const cmd = new Command(
          maybeData => {
            // TODO: REDO DELETED TWEENS?
            return this.CRUD.animations.createOne(this.state.animations, {
              num: Math.floor(Math.random() * 2000)
            });
          },

          item => {
            return this.CRUD.animations.deleteOne(
              this.state.animations,
              item.id
            );
          }
        );
        cmd.execute();
        this.undoStack[this.undoPointer] = cmd;
        this.undoPointer++;
      }
    });
  }

  render() {
    const { animations, tweens } = this.state;
    return (
      <div>
        <div>Animations</div>
        <div>
          {animations.map(anim => (
            <Anim key={anim.id} anim={anim} />
          ))}
        </div>
        <div>Tweens</div>
        <div>
          {tweens.map(anim => (
            <Anim key={tweens.id} anim={tweens} />
          ))}
        </div>
      </div>
    );
  }
}

// class Sample {
// 	state = {
// 		animations: [],
// 		tweens: [],
// 		keyframes: [],
// 		instances: []
// 	};

// 	constructor() {}

// 	deleteAnimation = animId => {
// 		const { list: animations, item, index } = db.deleteOne(
// 			this.state.animations,
// 			animId
// 		);

// 		if (item) {
// 		}
// 	};

// 	render() {
// 		return {
// 			animation: {
// 				create,
// 				get,
// 				set,
// 				delete: this.deleteAnimation
// 			}
// 		};
// 	}
// }