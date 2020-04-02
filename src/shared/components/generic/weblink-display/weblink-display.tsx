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
    @Prop({ default: 1500 }) public delay!: number;
    @Prop({ default: false }) public useHtmlTooltip!: boolean;
    @Prop({ default: false }) public noTooltip!: boolean;
    @Prop({ default: false }) public borderless!: boolean;
    @Ref('container') public container!: HTMLElement;

    public data(): any {
        return ({ showTooltip: false });
    }

    public mounted(): void {
        if (this.noTooltip) {
            return;
        }
        setTimeout(() => {
            if (this.container) {
                const { offsetWidth, scrollWidth } = this.container;
                this.$data.showTooltip = this.tooltip || offsetWidth < scrollWidth;
            }
        }, this.delay);
    }

    private toUrl(): void {
        if (this.url) {
            shell.openExternal(this.url);
        }
    }

    public render(): any {
        const tooltipText = this.tooltip || this.text;
        const className = `weblink-display-container ${this.borderless ? '' : 'border-mode'}`;

        const tooltip = this.useHtmlTooltip ?
            <div class="tooltip-content" slot="content" domPropsInnerHTML={tooltipText}></div> :
            <div class="tooltip-content" slot="content">{tooltipText}</div>;

        return (
            <el-tooltip class="tooltips"
                disabled={!this.$data.showTooltip}
                placement={this.tooltipPosition}
                effect="light">

                {tooltip}
                <div class={className} ref="container">
                    <a class="url" onClick={this.toUrl}>
                        {this.$slots.default}
                        {this.text}
                    </a>
                </div>
            </el-tooltip>
        );
    }
}
