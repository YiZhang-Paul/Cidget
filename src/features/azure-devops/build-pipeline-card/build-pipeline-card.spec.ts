import { shallowMount, Wrapper } from '@vue/test-utils';
import { assert as sinonExpect, spy } from 'sinon';

import { shell } from '../../../mocks/third-party/electron';

import BuildPipelineCard from './build-pipeline-card';

describe('build pipeline card component unit test', () => {
    let wrapper: Wrapper<BuildPipelineCard>;
    let shellSpy: any;
    let build: any;

    beforeEach(() => {
        build = {
            name: '20200103.4',
            startedOn: new Date(),
            url: 'build_url',
            message: 'build_message',
            pipeline: {
                name: 'pipeline_name',
                url: 'pipeline_url'
            },
            triggeredBy: {
                name: 'triggered_by_name',
                url: 'triggered_by_url',
                branch: {
                    name: 'branch_name',
                    url: 'branch_url',
                    isPullRequest: true
                }
            }
        };

        wrapper = shallowMount(BuildPipelineCard, { propsData: { build } });
        shellSpy = spy(shell, 'openExternal');
    });

    afterEach(() => {
        wrapper.destroy();
        shellSpy.restore();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.build.name).toBe('20200103.4');
    });

    test('should open external link', () => {
        wrapper.find('.pipeline-name').element.click();

        sinonExpect.calledOnce(shellSpy);
        sinonExpect.calledWith(shellSpy, 'pipeline_url');
    });

    test('should use proper timestamp', () => {
        build.startedOn = new Date(2020, 1, 5, 15);
        build.finishedOn = null;
        wrapper.setProps({ build: Object.assign({}, build) });

        expect(wrapper.vm['timestamp'].getTime()).toBe(build.startedOn.getTime());

        build.finishedOn = new Date(2020, 1, 5, 15, 5);
        wrapper.setProps({ build: Object.assign({}, build) });

        expect(wrapper.vm['timestamp'].getTime()).toBe(build.finishedOn.getTime());
    });

    test('should show elapsed time when possible', () => {
        build.result = 'succeeded';
        wrapper.setProps({ build: Object.assign({}, build) });

        expect(wrapper.contains('.elapsed-time')).toBeTruthy();

        build.result = null;
        wrapper.setProps({ build: Object.assign({}, build) });

        expect(wrapper.contains('.elapsed-time')).toBeFalsy();
    });

    test('should show correct branch name', () => {
        build.triggeredBy.branch.isPullRequest = true;
        wrapper.setProps({ build: Object.assign({}, build) });

        expect(wrapper.vm['branchName']).toBe('AUTO');

        build.triggeredBy.branch.isPullRequest = false;
        wrapper.setProps({ build: Object.assign({}, build) });

        expect(wrapper.vm['branchName']).toBe('branch_name');
    });

    test('should properly indicate build speed', () => {
        build.result = 'succeeded';
        build.finishedOn = new Date();
        build.startedOn = new Date(build.finishedOn.getTime() - 299999);
        wrapper.setProps({ build: Object.assign({}, build) });

        expect(wrapper.contains('.slow-build')).toBeFalsy();
        expect(wrapper.contains('.fast-build')).toBeTruthy();

        build.startedOn = new Date(build.finishedOn.getTime() - 300000);
        wrapper.setProps({ build: Object.assign({}, build) });

        expect(wrapper.contains('.slow-build')).toBeTruthy();
        expect(wrapper.contains('.fast-build')).toBeFalsy();
    });

    test('should properly display elapsed time', () => {
        build.finishedOn = new Date();
        build.startedOn = new Date(build.finishedOn.getTime() - 5000);
        wrapper.setProps({ build: Object.assign({}, build) });

        expect(wrapper.vm['elapsedTime']).toBe('5s');

        build.finishedOn = new Date();
        build.startedOn = new Date(build.finishedOn.getTime() - 65000);
        wrapper.setProps({ build: Object.assign({}, build) });

        expect(wrapper.vm['elapsedTime']).toBe('1m 5s');

        build.finishedOn = new Date();
        build.startedOn = new Date(build.finishedOn.getTime() - 3665000);
        wrapper.setProps({ build: Object.assign({}, build) });

        expect(wrapper.vm['elapsedTime']).toBe('1h 1m 5s');

        build.finishedOn = new Date();
        build.startedOn = new Date(build.finishedOn.getTime() - 3600000);
        wrapper.setProps({ build: Object.assign({}, build) });

        expect(wrapper.vm['elapsedTime']).toBe('1h');

        build.finishedOn = new Date();
        build.startedOn = new Date(build.finishedOn.getTime() - 3605000);
        wrapper.setProps({ build: Object.assign({}, build) });

        expect(wrapper.vm['elapsedTime']).toBe('1h 5s');
    });
});
