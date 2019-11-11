
export class MapStyle {


  // Estilos del mapa
  public static deepblue: any[] = [ {

    'colors': [ {'ruta': '#31ADFD', 'geocerca': '#FFFFFF' }],

    'maptheme': [   { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ 'weight': 0.9 }, { 'visibility': 'off' }] },

    { elementType: 'geometry', stylers: [{ color: '#2b57a0' }] },  // #152c52
    { elementType: 'labels.text.stroke', stylers: [{ 'visibility': 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#a9a9b0' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#a9a9b0' }]
    },
    {
      'featureType': 'all',
      'elementType': 'labels.icon',
      'stylers': [
        {
          'visibility': 'off'
        }
      ]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ 'visibility': 'off' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#2b57a0' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#303338' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#092047' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#303338' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#092047' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2f3948' }]
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#091426' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#092047' }]
    }]
   } ];

  public static lightblue: any[] = [
    {
      'colors': [ {'ruta': '#EEF8FF', 'geocerca': '#FFFFFF' }],

      'maptheme': [  {
        'featureType': 'all',
        'elementType': 'geometry',
        'stylers': [
          {
            'color': '#005383'
          }
        ]
      },
      {
        'featureType': 'all',
        'elementType': 'labels.text.fill',
        'stylers': [
          {
            'gamma': 0.01
          },
          {
            'lightness': 20
          },
          {
            'color': '#f9f7f7'
          }
        ]
      },
      {
        'featureType': 'all',
        'elementType': 'labels.text.stroke',
        'stylers': [
          {
            'saturation': -31
          },
          {
            'lightness': -33
          },
          {
            'weight': 2
          },
          {
            'gamma': 0.8
          },
          {
            'color': '#757575'
          },
          {
            'visibility': 'simplified'
          }
        ]
      },
      {
        'featureType': 'all',
        'elementType': 'labels.icon',
        'stylers': [
          {
            'visibility': 'off'
          }
        ]
      },
      {
        'featureType': 'landscape',
        'elementType': 'geometry',
        'stylers': [
          {
            'lightness': 30
          },
          {
            'saturation': 30
          }
        ]
      },
      {
        'featureType': 'poi',
        'elementType': 'geometry',
        'stylers': [
          {
            'saturation': 20
          }
        ]
      },
      {
        'featureType': 'poi.park',
        'elementType': 'geometry',
        'stylers': [
          {
            'lightness': 20
          },
          {
            'saturation': -20
          }
        ]
      },
      {
        'featureType': 'road',
        'elementType': 'geometry',
        'stylers': [
          {
            'lightness': 10
          },
          {
            'saturation': -30
          }
        ]
      },
      {
        'featureType': 'road',
        'elementType': 'geometry.stroke',
        'stylers': [
          {
            'saturation': 25
          },
          {
            'lightness': 25
          }
        ]
      },
      {
        'featureType': 'water',
        'elementType': 'all',
        'stylers': [
          {
            'lightness': -20
          }
        ]
      } ]
    }
  ];

  public static globaltransformation: any[] = [ {

    'colors': [ {'ruta': '#22E8AB', 'geocerca': '#FFFFFF' }],

    'maptheme': [  {
      'featureType': 'all',
      'elementType': 'labels.text.fill',
      'stylers': [
          {
              'color': '#ffffff'
          }
      ]
  },
  {
      'featureType': 'all',
      'elementType': 'labels.text.stroke',
      'stylers': [
          {
              'visibility': 'on'
          },
          {
              'color': '#3e606f'
          },
          {
              'weight': 2
          },
          {
              'gamma': 0.84
          }
      ]
  },
  {
      'featureType': 'all',
      'elementType': 'labels.icon',
      'stylers': [
          {
              'visibility': 'off'
          }
      ]
  },
  {
      'featureType': 'administrative',
      'elementType': 'geometry',
      'stylers': [
          {
              'weight': 0.6
          },
          {
              'color': '#313536'
          }
      ]
  },
  {
      'featureType': 'landscape',
      'elementType': 'geometry',
      'stylers': [
          {
              'color': '#44a688'
          }
      ]
  },
  {
      'featureType': 'poi',
      'elementType': 'all',
      'stylers': [
          {
              'visibility': 'on'
          }
      ]
  },
  {
      'featureType': 'poi',
      'elementType': 'geometry',
      'stylers': [
          {
              'color': '#13876c'
          }
      ]
  },
  {
      'featureType': 'poi',
      'elementType': 'labels.icon',
      'stylers': [
          {
              'visibility': 'off'
          }
      ]
  },
  {
      'featureType': 'poi.attraction',
      'elementType': 'geometry.stroke',
      'stylers': [
          {
              'color': '#f5e4e4'
          },
          {
              'visibility': 'off'
          }
      ]
  },
  {
      'featureType': 'poi.attraction',
      'elementType': 'labels',
      'stylers': [
          {
              'visibility': 'on'
          },
          {
              'lightness': '14'
          }
      ]
  },
  {
      'featureType': 'poi.park',
      'elementType': 'geometry',
      'stylers': [
          {
              'color': '#13876c'
          },
          {
              'visibility': 'simplified'
          }
      ]
  },
  {
      'featureType': 'road',
      'elementType': 'geometry',
      'stylers': [
          {
              'color': '#067372'
          },
          {
              'lightness': '-20'
          }
      ]
  },
  {
      'featureType': 'transit',
      'elementType': 'geometry',
      'stylers': [
          {
              'color': '#357374'
          }
      ]
  },
  {
      'featureType': 'water',
      'elementType': 'geometry',
      'stylers': [
          {
              'color': '#004757'
          }
      ]
  } ]
  }
  ];

  public static clasic: any[] = [ {
    'colors': [ {'ruta': '#31ADFD', 'geocerca': '#FF9C00' }],

    'maptheme': [ 

      {
        'featureType': 'all',
        'elementType': 'labels.icon',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    }
    ]
  }];
}
