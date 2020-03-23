import IBuildPipeline from './ci/build-pipeline.interface';
import IReleasePipeline from './cd/release-pipeline.interface';

export default interface IPipelineProvider<TContext> {
    fetchBuildDefinition(context: TContext): Promise<IBuildPipeline | null>;
    fetchReleaseDefinition(context: TContext): Promise<IReleasePipeline | null>;
}
