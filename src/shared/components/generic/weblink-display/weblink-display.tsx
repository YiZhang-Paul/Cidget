import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { shell } from 'electron';

import './weblink-display.scss';

@Component
export default class WeblinkDisplay extends tsx.Component<any> {
    @Prop() public text!: string;
    @Prop() public url!: string;
    @Prop({ default: 'top-start' }) public tooltipPosition!: string;
    @Prop({ default: false }) public isDarkMode!: boolean;

    public render(): any {
        return (
            <div class="weblink-display-container">
                <el-tooltip disabled={false}
                    placement={this.tooltipPosition}
                    effect={this.isDarkMode ? 'dark' : 'light'}
                    content={this.text}>
                    <a class="url" onClick={() => shell.openExternal(this.url)}>
                        {this.text}
                    </a>
                </el-tooltip>
            </div>
        );
    }
}
