import React from 'react';
import { createPersist } from 'utils/persist';
import db from 'utils/db';
import UndoRedo, { UndoCommand } from 'utils/UndoRedo';

const persist = {
	animation: createPersist('AnimationStore', {
		animations: [],
		instances: [],
		keyframes: [],
		tweens: []
	}),

	importer: createPersist('ImporterStore', {
		isOpen: false,
		replace: false
	}),

	stage: createPersist('StageStore', {
		gridSize: 22,
		showGrid: true
	}),

	ui: createPersist('UIStore', {
		expandedTweenId: -1,
		hiddenTweens: {},
		lockedTweens: {},
		selectedInstanceId: -1,

		// media
		duration: 3000,
		isLooping: true,
		isReversed: false,
		playhead: 0
	})
};

const INITIAL_STATE = {
	animation: {
		animations: persist.animation.animations.read(),
		instances: persist.animation.instances.read(),
		keyframes: persist.animation.keyframes.read(),
		tweens: persist.animation.tweens.read()
	},

	importer: {
		isOpen: persist.importer.isOpen.read(),
		replace: persist.importer.replace.read(),
		canImport: false,
		value: '',
		errors: [],
		warnings: []
	},

	stage: {
		gridSize: persist.stage.gridSize.read(),
		showGrid: persist.stage.showGrid.read()
	},

	user: {
		expandedTweenId: persist.user.expandedTweenId.read(),
		hiddenTweens: persist.user.hiddenTweens.read(),
		lockedTweens: persist.user.lockedTweens.read(),
		selectedInstanceId: persist.user.selectedInstanceId.read(),

		// media
		duration: persist.user.duration.read(),
		isLooping: persist.user.isLooping.read(),
		isPlaying: false,
		isReversed: persist.user.isReversed.read(),
		playhead: persist.user.playhead.read()
	}
};

const Context = React.createContext(INITIAL_STATE);

class Provider extends React.Component {
	state = INITIAL_STATE;

	createAnimation = () => {
		throw 'not implemented';
	};
	getAnimation = animationId => {
		throw 'not implemented';
	};
	getAnimations = () => {
		throw 'not implemented';
	};

	_deleteAnimation = animationId => db.deleteOne(this.state.animations, animationId);
	_deleteAnimations = animationIds => db.deleteMany(this.state.animations, animationIds);
	deleteAnimation = animationId => {
		// const t = this.crud.animations.deleteOne(this.state.animations, animationId);
		// t.execute();
		// this.undoRedo.push(t);

		const anim = this.getAnimation(animationId);
		if (!anim) return null;

		new DeleteCommand(
			() => {
				const { list: animations, item: deletedAnimation } = this._deleteAnimation(
					animationId
				);
				const { list: tweens, items: deletedTweens } = this._deleteTweens(
					t => t.animationId === animationId
				);
				const { list: keyframes, items: deletedKeyframes } = this._deleteKeyframes(
					kf => kf.animationId === animationId
				);

				// re-assign instances w/anim
				// const instances = this.getInstances(instance => instance.animationId === animationId);
				// if (instances.length > 0) {
				//   const instanceIds = instances.map(i => i.id);

				//   const nextAnimId = animations.length > 0 ? animations[0].id : -1;

				//   db.setMany(this.state.instances, instanceIds, { animationId: nextAnimId })

				// }

				return [deletedAnimation, deletedTweens, deletedKeyframes];
			},
			([deletedAnimation, deletedTweens, deletedKeyframes]) => {
				const { list: animations } = db.createOne(this.state.animations, deletedAnimation);
				const { list: tweens } = db.createMany(this.state.tweens, deletedTweens);
				const { list: keyframes } = db.createMany(this.state.keyframes, deletedKeyframes);

				this.setState({ animations, tweens, keyframes });
			}
		);

		throw 'not implemented';
	};

	createTween = (animationId, definitionId) => {
		throw 'not implemented';
	};
	getTween = tweenId => {
		throw 'not implemented';
	};
	getTweens = animationId => {
		throw 'not implemented';
	};

	_deleteTween = tweenId => db.deleteOne(this.state.tweens, tweenId);
	_deleteTweens = tweenIds => db.deleteMany(this.state.tweens, tweenIds);
	deleteTween = tweenId => {
		throw 'not implemented';
	};

	createKeyframe = tweenId => {
		throw 'not implemented';
	};
	getKeyframe = keyframeId => {
		throw 'not implemented';
	};
	getKeyframes = tweenId => {
		throw 'not implemented';
	};

	_deleteKeyframe = keyframeId => db.deleteOne(this.state.keyframes, keyframeId);
	_deleteKeyframes = keyframeIds => db.deleteMany(this.state.keyframes, keyframeIds);
	deleteKeyframe = keyframeId => {
		throw 'not implemented';
	};

	createInstance = animationId => {
		throw 'not implemented';
	};
	getInstance = instanceId => {
		throw 'not implemented';
	};
	getInstances = instanceIds => {
		return db.getMany(this.state.instances, instanceIds).items;
	};
	deleteInstance = instanceId => {
		throw 'not implemented';
	};

	render() {
		return <Context.Provider value={{}}>{this.props.children}</Context.Provider>;
	}
}

const MegaStore = ({ children }) => <Context.Consumer>{children}</Context.Consumer>;
MegaStore.Provider = Context.Provider;
export default MegaStore;
