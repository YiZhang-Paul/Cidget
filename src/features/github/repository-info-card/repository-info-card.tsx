import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import IRepository from '../../../core/interface/repository/repository.interface';

import './repository-info-card.scss';

@Component
export default class RepositoryInfoCard extends tsx.Component<any> {
    @Prop() public repository!: IRepository;

    private _colors!: Map<string, string>;

    public beforeMount(): void {
        this._colors = new Map<string, string>([
            ['javascript', 'darkyellow'],
            ['typescript', 'skyblue'],
            ['csharp', 'green'],
        ]);
    }

    public render(): any {
        const typeIcon = this.repository.isPrivate ? 'el-icon-lock private' : 'el-icon-view public';
        const licenseIcon = <i class="el-icon-collection-tag license"></i>;
        const license = <div>{licenseIcon}{this.repository.license}</div>;
        const color = this._colors?.get(this.repository.language.toLowerCase()) || 'grey';

        return (
            <div class="repository-info-card-container">
                <div><i class={typeIcon}></i></div>
                <div>
                    <i class="language fas fa-circle" style={{ 'color': color }}></i>
                    {this.repository.language}
                </div>
                {this.repository.license ? license : ''}
            </div>
        );
    }
}
