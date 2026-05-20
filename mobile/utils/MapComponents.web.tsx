import React from 'react';
import { View } from 'react-native';

export const Marker = (props: any) => <View {...props} />;
export const Polyline = (props: any) => <View {...props} />;
export const Circle = (props: any) => <View {...props} />;

export default class MapView extends React.Component<any> {
  render() {
    return <View {...this.props} />;
  }
}
