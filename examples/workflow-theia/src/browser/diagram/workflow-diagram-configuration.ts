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
import 'sprotty-theia/css/theia-sprotty.css';

import { createWorkflowDiagramContainer } from '@eclipse-glsp-examples/workflow-glsp/lib';
import {
    GLSPTheiaDiagramConfiguration
} from '@eclipse-glsp/theia-integration/lib/browser/diagram/glsp-theia-diagram-configuration';
import { Container, injectable } from 'inversify';

import { WorkflowLanguage } from '../../common/workflow-language';
import { WorkflowDiagramServer } from './workflow-diagram-server';

@injectable()
export class WorkflowDiagramConfiguration extends GLSPTheiaDiagramConfiguration {
    diagramType: string = WorkflowLanguage.DiagramType;

    doCreateContainer(widgetId: string): Container {
        const container = createWorkflowDiagramContainer(widgetId);
        this.configureDiagramServer(container, WorkflowDiagramServer);
        return container;
    }
}
