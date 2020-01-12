import { Component } from 'vue-property-decorator'
import * as tsx from 'vue-tsx-support'

import './styles.scss'

@Component({})
export default class App extends tsx.Component<any> {

    public render(): any {
        return (<div id="app"></div>)
    }
}
