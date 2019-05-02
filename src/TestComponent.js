import React from 'react';
import noop from 'lodash/noop';
import { createPersist } from 'utils/persist';
import db from 'utils/db';
import UndoRedo from 'utils/UndoRedo';

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
    Tween #{tween.id} - anim #{tween.animationId}
  </div>
);

export default class TestComponent extends React.Component {
  undoRedo = new UndoRedo();

  state = {
    animations: persist.animations.read(),
    keyframes: persist.keyframes.read(),
    tweens: persist.animations.read()
  };

  deleteAnimation = animationId => {
    const anim = this.getAnimation(animationId);
    if (anim) {
      new DeleteCommand(
        () => {
          const { list: animations, item: deletedAnimation } = db.deleteOne(
            this.state.animations,
            anim.id
          );
          const { list: tweens, items: deletedTweens } = db.deleteMany(
            this.state.tweens,
            t => t.animationId === anim.id
          );
          const { list: keyframes, items: deletedKeyframes } = db.deleteMany(
            this.state.keyframes,
            kf => kf.animationId === anim.id
          );

          this.setState({ animations, tweens, keyframes });

          return [deletedAnimation, deletedTweens, deletedKeyframes];
        },
        ([deletedAnimation, deletedTweens, deletedKeyframes]) => {
          const { list: animations } = db.createOne(this.state.animations, deletedAnimation);
          const { list: tweens } = db.createMany(this.state.tweens, deletedTweens);
          const { list: keyframes } = db.createMany(this.state.keyframes, deletedKeyframes);

          this.setState({ animations, tweens, keyframes });
        }
      );
    }
  };

  componentDidMount() {
    document.addEventListener('keydown', e => {
      if (e.code === 'KeyZ' && e.metaKey) {
        e.preventDefault();
        if (e.shiftKey) {
          this.undoRedo.redo();
        } else {
          this.undoRedo.undo();
        }
      }

      if (e.code === 'KeyE') {
        this.undoRedo.execute(
          () => {
            const { list: animations, item: addedAnimation } = db.createOne(this.state.animations, {
              num: Math.floor(Math.random() * 2000)
            });

            this.setState({ animations });

            return addedAnimation;
          },

          addedAnimation => {
            const { list: animations } = db.deleteOne(this.state.animations, addedAnimation.id);

            this.setState({ animations });
          }
        );
      }

      if (e.code === 'KeyT') {
        const anim = this.state.animations[
          Math.floor(Math.random() * this.state.animations.length)
        ];
        if (anim) {
          this.undoRedo.execute(
            () => {
              const { list: tweens, item: createdTween } = db.createOne(this.state.tweens, {
                animationId: anim.id
              });

              this.setState({ tweens });
              return createdTween;
            },
            createdTween => {
              const { list: tweens } = db.deleteOne(this.state.tweens, createdTween.id);

              this.setState({ tweens });
            }
          );
        }
      }

      if (e.code === 'KeyD') {
        const anim = this.state.animations[
          Math.floor(Math.random() * this.state.animations.length)
        ];
        if (anim) {
          this.undoRedo.execute(
            () => {
              const { list: animations, item: deletedAnimation } = db.deleteOne(
                this.state.animations,
                anim.id
              );
              const { list: tweens, items: deletedTweens } = db.deleteMany(
                this.state.tweens,
                t => t.animationId === anim.id
              );
              const { list: keyframes, items: deletedKeyframes } = db.deleteMany(
                this.state.keyframes,
                kf => kf.animationId === anim.id
              );

              this.setState({ animations, tweens, keyframes });

              return [deletedAnimation, deletedTweens, deletedKeyframes];
            },
            ([deletedAnimation, deletedTweens, deletedKeyframes]) => {
              const { list: animations } = db.createOne(this.state.animations, deletedAnimation);
              const { list: tweens } = db.createMany(this.state.tweens, deletedTweens);
              const { list: keyframes } = db.createMany(this.state.keyframes, deletedKeyframes);

              this.setState({ animations, tweens, keyframes });
            }
          );
        }
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
          {tweens.map(tween => (
            <Tween key={tween.id} tween={tween} />
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

// 	deleteAnimation = animationId => {
// 		const { list: animations, item, index } = db.deleteOne(
// 			this.state.animations,
// 			animationId
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
