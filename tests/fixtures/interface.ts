// Named parameters in a declaration context are not "unused". The core
// no-unused-vars rule cannot tell -- only the typescript-eslint one can.
export interface NodeSocket {
	disconnect: () => void;
	emit: (event: string, ...args: unknown[]) => void;
	off: (event: string, listener?: (...args: unknown[]) => void) => void;
	on: (event: string, listener: (...args: unknown[]) => void) => void;
}

export type Handler = (payload: string) => void;
