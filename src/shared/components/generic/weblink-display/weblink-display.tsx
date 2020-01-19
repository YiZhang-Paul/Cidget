import { Component, Prop, Ref } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { shell } from 'electron';

import './weblink-display.scss';

@Component
export default class WeblinkDisplay extends tsx.Component<any> {
    @Prop() public text!: string;
    @Prop() public url!: string;
    @Prop({ default: 'top-start' }) public tooltipPosition!: string;
    @Prop({ default: false }) public isDarkMode!: boolean;
    @Prop({ default: false }) private _showTooltip!: boolean;

    @Ref('container') public container!: HTMLElement;

    public mounted(): void {
        this._showTooltip = this.container.offsetWidth < this.container.scrollWidth;
    }

    public render(): any {
        return (
            <div class="weblink-display-container" ref="container">
                <el-tooltip disabled={!this._showTooltip}
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
