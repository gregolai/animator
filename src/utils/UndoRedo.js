export class UndoCommand {
	constructor(executeFn, undoFn) {
		this._execute = executeFn;
		this._undo = undoFn;
		this._executeResult = undefined;
		this._undoResult = undefined;
	}
	execute() {
		this._executeResult = this._execute(this._undoResult);
	}
	undo() {
		this._undoResult = this._undo(this._executeResult);
	}
}

export default class UndoRedo {
	_commands = [];
	_pointer = -1;
	execute(executeFn, undoFn) {
		this._commands = this._commands.slice(0, this._pointer + 1);

		const cmd = new UndoCommand(executeFn, undoFn);
		cmd.execute();
		this._commands.push(cmd);
		this._pointer++;
	}
	undo() {
		if (this._pointer >= 0) {
			this._commands[this._pointer].undo();
			this._pointer--;
		}
	}
	redo() {
		if (this._commands.length - 1 > this._pointer) {
			this._pointer++;
			this._commands[this._pointer].execute();
		}
	}
}
