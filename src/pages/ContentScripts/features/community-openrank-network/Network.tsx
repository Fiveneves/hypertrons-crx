import React, { CSSProperties, useEffect, useRef } from 'react';
import * as echarts from 'echarts';

import linearMap from '../../../../helpers/linear-map';
import { debounce } from 'lodash-es';
import getGithubTheme from '../../../../helpers/get-github-theme';

interface NetworkProps {
  /**
   * data
   */
  readonly data: any;
  /**
   * `style` for graph container
   */
  readonly style?: CSSProperties;
  /**
   * callback function when click node
   */
  readonly focusedNodeID?: string;

  date?: string;
}

const typeMap = new Map([
  ['r', 'repo'],
  ['i', 'issue'],
  ['p', 'pull'],
  ['u', 'user'],
]);

const genName = (node: { c: string; n: { toString: () => any } }) =>
  node.c == 'i' || node.c == 'p' ? `#${node.n.toString()}` : node.n.toString();

const categories = Array.from(typeMap.values());

const theme = getGithubTheme();
const DARK_TEXT_COLOR = 'rgba(230, 237, 243, 0.9)';

const generateEchartsData = (data: any, focusedNodeID: string | undefined): any => {
  const generateNodes = (nodes: any[]): any => {
    return nodes.map((n: any) => {
      return {
        id: n.id,
        name: genName(n),
        value: n.v,
        symbolSize: Math.log(n.v + 1) * 6,
        category: typeMap.get(n.c),
      };
    });
  };
  const generateEdges = (edges: any[]): any => {
    if (edges.length === 0) {
      return [];
    }
    return edges.map((e: any) => {
      return {
        source: e.s,
        target: e.t,
        value: e.w,
      };
    });
  };
  return {
    nodes: generateNodes(data.nodes),
    edges: generateEdges(data.links),
  };
};

const Network: React.FC<NetworkProps> = ({ data, style = {}, focusedNodeID, date }) => {
  const divEL = useRef(null);
  const graphData = generateEchartsData(data, focusedNodeID);
  const option = {
    tooltip: {
      trigger: 'item',
    },
    animation: true,
    animationDuration: 2000,
    // title: {
    //   text: `OpenRank details for ${focusedNodeID} in ${date}`,
    //   top: 'bottom',
    //   left: 'right'
    // },
    legend: [
      {
        data: categories,
      },
    ],
    series: [
      {
        name: 'Collaborative graph',
        type: 'graph',
        layout: 'force',
        nodes: graphData.nodes,
        edges: graphData.edges,
        categories: categories.map((c) => {
          return { name: c };
        }),
        // Enable mouse zooming and translating
        roam: true,
        label: {
          position: 'right',
          show: true,
        },
        force: {
          // initLayout: 'circular',
          // gravity: 0.1,
          repulsion: 300,
          // edgeLength: [50, 100],
          // Disable the iteration animation of layout
          layoutAnimation: false,
        },
        lineStyle: {
          curveness: 0.3,
          opacity: 0.2,
        },
        emphasis: {
          focus: 'adjacency',
          label: {
            position: 'right',
            show: true,
          },
        },
      },
    ],
    graphic: {
      elements: [
        {
          type: 'text',
          right: 60,
          bottom: 60,
          style: {
            text: date,
            font: 'bolder 60px monospace',
            fill: theme === 'light' ? 'rgba(100, 100, 100, 0.3)' : DARK_TEXT_COLOR,
          },
          z: 100,
        },
      ],
    },
  };

  const clearDiv = (id: string) => {
    var div = document.getElementById(id);
    if (div && div.hasChildNodes()) {
      var children = div.childNodes;
      for (var child of children) {
        div.removeChild(child);
      }
    }
  };

  const addRow = (table: HTMLElement | null, texts: any[]) => {
    // @ts-ignore
    var tr = table.insertRow();
    for (var t of texts) {
      var td = tr.insertCell();
      td.appendChild(document.createTextNode(t));
    }
  };

  const setDetails = (graph: { links: any[]; nodes: any[] }, node: { r: number; i: number; id: any }) => {
    clearDiv('details_table');
    var table = document.getElementById('details_table');
    addRow(table, ['From', 'Ratio', 'Value', 'OpenRank']);
    addRow(table, ['Self', node.r, node.i, (node.r * node.i).toFixed(3)]);
    var other = graph.links
      .filter((l) => l.t == node.id)
      .map((l) => {
        var source = graph.nodes.find((n) => n.id == l.s);
        return [
          genName(source),
          parseFloat(((1 - node.r) * l.w).toFixed(3)),
          source.v,
          parseFloat(((1 - node.r) * l.w * source.v).toFixed(3)),
        ];
      })
      .sort((a, b) => b[3] - a[3]);
    for (var r of other) {
      addRow(table, r);
    }
  };

  useEffect(() => {
    let chartDOM = divEL.current;
    const instance = echarts.init(chartDOM as any);

    return () => {
      instance.dispose();
    };
  }, []);

  useEffect(() => {
    let chartDOM = divEL.current;
    const instance = echarts.getInstanceByDom(chartDOM as any);
    if (instance) {
      instance.setOption(option);
      instance.on('dblclick', function (params) {
        setDetails(
          data,
          // @ts-ignore
          data.nodes.find((i: { id: any }) => i.id === params.data.id)
        );
      });
      const debouncedResize = debounce(() => {
        instance.resize();
      }, 1000);
      window.addEventListener('resize', debouncedResize);
    }
  }, []);

  return (
    <div className="hypertrons-crx-border">
      <div ref={divEL} style={style}></div>
    </div>
  );
};

export default Network;
