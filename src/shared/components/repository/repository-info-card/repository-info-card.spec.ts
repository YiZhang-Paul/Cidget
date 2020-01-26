import { shallowMount, Wrapper } from '@vue/test-utils';

import RepositoryInfoCard from './repository-info-card';

describe('repository info card component unit test', () => {
    let wrapper: Wrapper<RepositoryInfoCard>;
    let repository: any;

    beforeEach(() => {
        repository = {
            id: 'repository_id',
            isPrivate: false,
            language: { abbr: 'TS' }
        };

        wrapper = shallowMount(RepositoryInfoCard, { propsData: { repository } });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.repository.id).toBe('repository_id');
    });

    test('should display correct repository type', () => {
        repository.isPrivate = true;
        wrapper.setProps({ repository: Object.assign({}, repository) });

        expect(wrapper.contains('.public')).toBeFalsy();
        expect(wrapper.contains('.private')).toBeTruthy();

        repository.isPrivate = false;
        wrapper.setProps({ repository: Object.assign({}, repository) });

        expect(wrapper.contains('.public')).toBeTruthy();
        expect(wrapper.contains('.private')).toBeFalsy();
    });

    test('should set correct color for languages', () => {
        repository.language.abbr = 'C#';
        wrapper.setProps({ repository: Object.assign({}, repository) });

        expect(wrapper.find('.language').element.style.color).toBe('green');

        repository.language = null;
        wrapper.setProps({ repository: Object.assign({}, repository) });

        expect(wrapper.find('.language').element.style.color).toBe('grey');
    });

    test('should display license information when possible', () => {
        repository.license = { abbr: 'MIT' };
        wrapper.setProps({ repository: Object.assign({}, repository) });

        expect(wrapper.contains('.license-info')).toBeTruthy();

        repository.license = null;
        wrapper.setProps({ repository: Object.assign({}, repository) });

        expect(wrapper.contains('.license-info')).toBeFalsy();
    });
});
