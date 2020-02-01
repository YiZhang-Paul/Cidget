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
    @Prop({ default: false }) public borderless!: boolean;
    @Prop({ default: false }) public isDarkMode!: boolean;
    @Ref('container') public container!: HTMLElement;

    private get colorMode(): string {
        return this.isDarkMode ? 'dark' : 'light';
    }

    public data(): any {
        return ({ showTooltip: false });
    }

    public mounted(): void {
        const overflow = this.container.offsetWidth < this.container.scrollWidth;
        this.$data.showTooltip = this.tooltip || overflow;
    }

    private toUrl(): void {
        if (this.url) {
            shell.openExternal(this.url);
        }
    }

    public render(): any {
        const className = `weblink-display-container ${this.borderless ? '' : 'border-mode'}`;

        return (
            <div class={className} ref="container">
                <el-tooltip disabled={!this.$data.showTooltip}
                    placement={this.tooltipPosition}
                    effect={this.colorMode}
                    content={this.tooltip || this.text}>

                    <a class="url" onClick={this.toUrl}>
                        {this.text}
                    </a>
                </el-tooltip>
            </div>
        );
    }
}
