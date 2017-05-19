import 'ui/vislib';
import 'plugins/kbn_vislib_vis_types/controls/vislib_basic_options';
import 'plugins/kbn_vislib_vis_types/controls/point_series_options';
import 'plugins/kbn_vislib_vis_types/controls/line_interpolation_option';
import 'plugins/kbn_vislib_vis_types/controls/heatmap_options';
import 'plugins/kbn_vislib_vis_types/controls/point_series';
import { VisTypeProvider } from './base_vis_type';
import { AggResponsePointSeriesProvider } from 'ui/agg_response/point_series/point_series';
import VislibProvider from 'ui/vislib';

export function VislibVisTypeProvider(Private) {
  const VisType = Private(VisTypeProvider);
  const pointSeries = Private(AggResponsePointSeriesProvider);
  const vislib = Private(VislibProvider);

  class VislibVisController {
    constructor(el) {
      this.el = el;
    }

    render(vis, esResponse) {
      if (this.vislibVis) {
        this.destroy();
      }

      return new Promise(resolve => {
        this.vis = vis;
        this.vislibVis = new vislib.Vis(this.el, vis.params);
        this.vislibVis.on('brush', vis.API.events.brush);
        this.vislibVis.on('click', vis.API.events.filter);
        this.vislibVis.on('renderComplete', resolve);
        this.vislibVis.render(esResponse, vis.getUiState());
        this.refreshLegend++;
      });
    }

    destroy() {
      if (this.vislibVis) {
        this.vislibVis.off('brush', this.vis.API.events.brush);
        this.vislibVis.off('click', this.vis.API.events.filter);
        this.vislibVis.destroy();
      }
    }
  }

  class VislibVisType extends VisType {
    constructor(opts) {
      if (!opts.responseHandler) {
        opts.responseHandler = 'basic';
      }
      if (!opts.responseConverter) {
        opts.responseConverter = pointSeries;
      }
      opts.visualization = VislibVisController;
      super(opts);
      this.refreshLegend = 0;
    }
  }

  return VislibVisType;
}