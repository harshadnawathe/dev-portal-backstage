import {Entity, parseEntityRef, getCompoundEntityRef, ComponentEntity} from '@backstage/catalog-model';
import {
    CatalogProcessor,
    LocationSpec,
    CatalogProcessorEmit,
    processingResult
} from '@backstage/plugin-catalog-backend';


export interface DataComponentEntity extends ComponentEntity {
    spec : ComponentEntity["spec"] & {
        consumesResources?: string[],
        producesResources?: string[],
    }
}

export class DataComponentProcessor implements CatalogProcessor {
    getProcessorName = (): string => {
        return "DataComponentProcessor";
    };

    postProcessEntity = async (entity: Entity, _location: LocationSpec, emit: CatalogProcessorEmit): Promise<Entity> => {
        const selfRef = getCompoundEntityRef(entity);

        function doEmit(
            targets: string | string[] | undefined,
            context: { defaultKind?: string; defaultNamespace: string },
            outgoingRelation: string,
            incomingRelation: string,
        ): void {
            if (!targets) {
                return;
            }
            for (const target of [targets].flat()) {
                const targetRef = parseEntityRef(target, context);
                emit(
                    processingResult.relation({
                        source: selfRef,
                        type: outgoingRelation,
                        target: {
                            kind: targetRef.kind,
                            namespace: targetRef.namespace,
                            name: targetRef.name,
                        },
                    }),
                );
                emit(
                    processingResult.relation({
                        source: {
                            kind: targetRef.kind,
                            namespace: targetRef.namespace,
                            name: targetRef.name,
                        },
                        type: incomingRelation,
                        target: selfRef,
                    }),
                );
            }
        }



        if (entity.kind === "Component" ) {
            const component = entity as ComponentEntity;

            if(component.spec.type === "data") {
                const dataComponent = component as DataComponentEntity
                doEmit(
                    dataComponent.spec.consumesResources,
                    { defaultKind: 'Resource', defaultNamespace: selfRef.namespace },
                    'consumesResource',
                    'resourceConsumedBy',
                );

                doEmit(
                    dataComponent.spec.producesResources,
                    {defaultKind: 'Resource', defaultNamespace: selfRef.namespace},
                    'producesResource',
                    'resourceProducedBy',
                );
            }
        }
        return entity;
    };
}
