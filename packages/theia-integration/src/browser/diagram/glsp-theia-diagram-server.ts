/********************************************************************************
 * Copyright (c) 2019 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
import {
    Action,
    ActionHandlerRegistry,
    ComputedBoundsAction,
    ExportSvgAction,
    isServerMessageAction,
    isSetEditModeAction,
    registerDefaultGLSPServerActions,
    ServerMessageAction,
    SetEditModeAction,
    SourceUriAware
} from '@eclipse-glsp/client';
import { Emitter, Event } from '@theia/core/lib/common';
import { injectable } from 'inversify';
import { TheiaDiagramServer } from 'sprotty-theia';

import { GLSPTheiaSprottyConnector } from './glsp-theia-sprotty-connector';

const receivedFromServerProperty = '__receivedFromServer';

@injectable()
export class GLSPTheiaDiagramServer extends TheiaDiagramServer implements DirtyStateNotifier, SourceUriAware {

    readonly dirtyStateChangeEmitter: Emitter<DirtyState> = new Emitter<DirtyState>();

    protected dirtyState: DirtyState = { isDirty: false };

    initialize(registry: ActionHandlerRegistry): void {
        registry.register(SetDirtyStateAction.KIND, this);
        registry.register(ServerMessageAction.KIND, this);
        registry.register(ExportSvgAction.KIND, this);
        registerDefaultGLSPServerActions(registry, this);
    }

    public getSourceURI(): string {
        return this.sourceUri;
    }

    get onDirtyStateChange(): Event<DirtyState> {
        return this.dirtyStateChangeEmitter.event;
    }

    protected setDirty(dirty: boolean): void {
        if (dirty !== this.dirtyState.isDirty) {
            this.dirtyState = { isDirty: dirty };
            this.dirtyStateChangeEmitter.fire(this.dirtyState);
        }
    }

    handleLocally(action: Action): boolean {
        if (isSetDirtyStateAction(action)) {
            this.setDirty(action.isDirty);
            return false;
        }
        if (isServerMessageAction(action)) {
            return this.handleServerMessageAction(action);
        }
        if (isSetEditModeAction(action)) {
            return this.handleSetEditModeAction(action);
        }
        return super.handleLocally(action);
    }

    handleExportSvgAction(action: ExportSvgAction): boolean {
        this.connector.save(this.sourceUri, action);
        return false;
    }

    protected handleComputedBounds(_action: ComputedBoundsAction): boolean {
        return true;
    }

    protected handleSetEditModeAction(action: SetEditModeAction): boolean {
        return (action as any)[receivedFromServerProperty] !== true;
    }

    protected handleServerMessageAction(status: ServerMessageAction): boolean {
        (this.connector as GLSPTheiaSprottyConnector).showMessage(this.clientId, status);
        return false;
    }
}
export class SetDirtyStateAction implements Action {
    static readonly KIND = 'setDirtyState';
    constructor(public readonly isDirty: boolean, public readonly reason?: string,
        public readonly kind = SetDirtyStateAction.KIND) { }
}

export namespace DirtyStateChangeReason {
    export const OPERATION = 'operation';
    export const UNDO = 'undo';
    export const REDO = 'redo';
    export const SAVE = 'save';
    export const EXTERNAL = 'external';
}

export function isSetDirtyStateAction(action: Action): action is SetDirtyStateAction {
    return SetDirtyStateAction.KIND === action.kind && 'isDirty' in action
        && typeof (action['isDirty']) === 'boolean' && 'reason' in action;
}

export interface DirtyState {
    isDirty: boolean;
}

export interface DirtyStateNotifier {
    readonly onDirtyStateChange: Event<DirtyState>;
}

export namespace DirtyStateNotifier {
    export function is(arg: any): arg is DirtyStateNotifier {
        return !!arg && ('onDirtyStateChange' in arg);
    }
}
