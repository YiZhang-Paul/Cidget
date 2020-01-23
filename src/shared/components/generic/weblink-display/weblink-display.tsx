import { Component, Prop, Ref } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { shell } from 'electron';

import './weblink-display.scss';

@Component
export default class WeblinkDisplay extends tsx.Component<any> {
    @Prop() public text!: string;
    @Prop() public tooltip!: string;
    @Prop() public url!: string;
    @Prop({ default: 'top-start' }) public tooltipPosition!: string;
    @Prop({ default: false }) public isDarkMode!: boolean;
    @Prop({ default: true }) private _showTooltip!: boolean;

    @Ref('container') public container!: HTMLElement;

    private get colorMode(): string {
        return this.isDarkMode ? 'dark' : 'light';
    }

    public mounted(): void {
        if (!this.tooltip) {
            this._showTooltip = this.container.offsetWidth < this.container.scrollWidth;
        }
    }

    public render(): any {
        return (
            <div class="weblink-display-container" ref="container">
                <el-tooltip disabled={!this._showTooltip}
                    placement={this.tooltipPosition}
                    effect={this.colorMode}
                    content={this.tooltip || this.text}>

                    <a class="url" onClick={() => shell.openExternal(this.url)}>
                        {this.text}
                    </a>
                </el-tooltip>
            </div>
        );
    }
}
