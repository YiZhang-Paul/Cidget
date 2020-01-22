import { shallowMount, Wrapper } from '@vue/test-utils';

import RepositoryInfoCard from './repository-info-card';

describe('repository info card component unit test', () => {
    let wrapper: Wrapper<RepositoryInfoCard>;

    beforeEach(() => {
        const repository = {
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
});
