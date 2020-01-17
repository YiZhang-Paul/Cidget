import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { shell } from 'electron';

import IGithubUser from '../../../core/interface/repository/github/github-user.interface';

import './user-info-card.scss';

@Component
export default class UserInfoCard extends tsx.Component<any> {
    @Prop() public initiator!: IGithubUser;

    private toProfile(): void {
        shell.openExternal(this.initiator.profileUrl);
    }

    private toRepositories(): void {
        shell.openExternal(`${this.initiator.profileUrl}?tab=repositories`);
    }

    private toGist(): void {
        shell.openExternal(this.initiator.gistUrl);
    }

    private toFollowers(): void {
        shell.openExternal(`${this.initiator.profileUrl}?tab=followers`);
    }

    public render(): any {
        return (
            <div class="user-info-card-container">
                <div>
                    <a onClick={this.toProfile}>{this.initiator.name}</a>
                </div>

                <div>{this.initiator.email}</div>

                <div class="statistics">
                    <a onClick={this.toRepositories}>
                        <i class="el-icon-s-management"></i>
                        {this.initiator.repositoryCount}
                    </a>

                    <a onClick={this.toGist}>
                        <i class="el-icon-s-opportunity"></i>
                        {this.initiator.gistCount}
                    </a>

                    <a onClick={this.toFollowers}>
                        <i class="el-icon-star-on"></i>
                        {this.initiator.followerCount}
                    </a>
                </div>
            </div>
        );
    }
}
