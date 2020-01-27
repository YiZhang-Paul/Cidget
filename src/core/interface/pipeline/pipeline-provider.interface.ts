import IBuildPipeline from './build-pipeline.interface';
import IReleasePipeline from './release-pipeline.interface';

export default interface IPipelineProvider<TContext> {
    fetchBuildDefinition(context: TContext): Promise<IBuildPipeline | null>;
    fetchReleaseDefinition(context: TContext): Promise<IReleasePipeline | null>;
}
