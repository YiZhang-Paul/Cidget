import { shallowMount, Wrapper } from '@vue/test-utils';

import ReleasePipelineCard from './release-pipeline-card';

describe('release pipeline card component unit test', () => {
    let wrapper: Wrapper<ReleasePipelineCard>;
    let release: any;

    beforeEach(() => {
        release = {
            name: 'Release-4',
            activeStage: 'stage-2',
            status: 'needs approval',
            createdOn: new Date(),
            url: 'release_url',
            stages: [
                { name: 'stage-1', status: 'succeeded' },
                { name: 'stage-2', status: 'inProgress' }
            ],
            pipeline: {
                id: 'pipeline_id',
                name: 'pipeline_name',
                url: 'pipeline_url'
            },
            triggeredBy: {
                name: 'triggered_by_name',
                url: 'triggered_by_url'
            }
        };

        wrapper = shallowMount(ReleasePipelineCard, { propsData: { release } });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.release.name).toBe('Release-4');
    });

    test('should properly show stage status', () => {
        expect(wrapper.vm['stages'][0].name).toBe('stage-1');
        expect(wrapper.vm['stages'][0].scale).toBe(4);
        expect(wrapper.vm['stages'][1].name).toBe('stage-2');
        expect(wrapper.vm['stages'][1].scale).toBe(3);

        release.stages = null;
        wrapper.setProps({ release: Object.assign({}, release) });

        expect(wrapper.vm['stages'].length).toBe(0);
    });

    test('should properly indicate abandoned release', () => {
        release.status = 'abandoned';
        wrapper.setProps({ release: Object.assign({}, release) });

        expect(wrapper.contains('.abandoned')).toBeTruthy();

        release.status = 'needs approval';
        wrapper.setProps({ release: Object.assign({}, release) });

        expect(wrapper.contains('.abandoned')).toBeFalsy();
    });
});
