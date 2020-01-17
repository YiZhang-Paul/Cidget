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

    private toGist(): void {
        shell.openExternal(this.initiator.gistUrl);
    }

    public render(): any {
        return (
            <div class="user-info-card-container">
                <div>
                    <span class="name" onClick={this.toProfile}>
                        {this.initiator.name}
                    </span>
                </div>
                <div>{this.initiator.email}</div>
                <div>
                    <span class="gist" onClick={this.toGist}>
                        {this.initiator.gistCount} gists
                    </span>
                </div>
            </div>
        );
    }
}
