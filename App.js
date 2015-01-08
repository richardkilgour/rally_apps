Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    _releasesWithFeatures: [],
    _uniqueColumns: [],
    _additionalColumns: [],
    _updatedColumns: [],
    _cardBoard: null,

    launch: function() {
        var that = this;

        this._releasePicker = Ext.create('Rally.ui.dialog.SolrArtifactChooserDialog', {
            artifactTypes: ['Release'],
            autoShow: true,
            multiple: true,
            listeners: {
                artifactChosen: function(me, selectedRecords) {
                    this._onSelectedReleases(selectedRecords);
                },
                scope: this
            },
            storeConfig: {
                filters: [{
                    property: 'Project.Name',
                    value: 'Speech Technology'
                }]
            }
        });

        Ext.create('Ext.Container', {
            xtype: 'rallybutton',
            id: 'getReleases',
            text: 'Choose Selected Releases',
            handler: function() {
                this._releasePicker.show();
            },
            renderTo: Ext.getBody().dom
        });

        Ext.create('Rally.data.WsapiDataStore', {
            model: 'PortfolioItem/Feature',
            fetch: ['FormattedID', 'Name', 'Release'],
            pageSize: 100,
            autoLoad: true,
            filters: [{
                property: 'Release',
                operator: '!=',
                value: null
            }, {
                property: 'State',
                operator: '!=',
                value: 'Done'
            }],
            listeners: {
                load: this._onScheduledFeaturesLoaded,
                scope: this
            }
        });
    },

    _onScheduledFeaturesLoaded: function(store, data) {
        var that = this;
        if (data.length !== 0) {
            _.each(data, function(feature) {
                console.log('feature ', feature.get('FormattedID'), 'scheduled for ', feature.get('Release')._refObjectName, feature.get('Release')._ref);
                that._releasesWithFeatures.push(feature.get('Release'));
            });
            that._makeBoard();
        }
        else {
            console.log('there are no features scheduled for a release');
        }
    },
    
    _makeBoard: function() {
        if (this._cardBoard) {
            this._cardBoard.destroy();
        }

        var columns = [];

        _.each(this._releasesWithFeatures, function(rel) {
            columns.push({
                value: rel._ref,
                columnHeaderConfig: {
                    headerTpl: '{release}',
                    headerData: {
                        release: rel._refObjectName
                    }
                }
            });
        });

        this._uniqueColumns = _.uniq(columns, 'value');

        var cardBoard = {
            xtype: 'rallycardboard',
            itemId: 'piboard',
            types: ['PortfolioItem/Feature'],
            attribute: 'Release',
            fieldToDisplay: 'Release',
            columns: this._uniqueColumns
        };

        this._cardBoard = this.add(cardBoard);
    },

    _onSelectedReleases: function(selectedReleases) {
        var that = this;
        var expandedColumns = [];
        console.log(selectedReleases);
        //var selectedReleases = this._releasePicker._getRecordValue();
        if (selectedReleases === undefined) {
            return;
        }
        console.log(selectedReleases.length);
        if (selectedReleases.length > 0) {
            _.each(selectedReleases, function(rel) {
                console.log(rel.get('Name'));
                var releaseName = rel.get('Name');
                var releaseRef = rel.get('_ref');
                that._additionalColumns.push({
                    value: releaseRef,
                    columnHeaderConfig: {
                        headerTpl: '{release}',
                        headerData: {
                            release: releaseName
                        }
                    }
                });
            });
        }
        expandedColumns = _.union(that._uniqueColumns, that._additionalColumns);
        this._updatedColumns = _.uniq(expandedColumns, 'value');
        this._updateBoard();
    },

    _updateBoard: function() {
        var that = this;

        if (this._cardBoard) {
            this._cardBoard.destroy();
        }
        var cardBoard = {
            xtype: 'rallycardboard',
            types: ['PortfolioItem/Feature'],
            attribute: 'Release',
            fieldToDisplay: 'Release',
            columns: that._updatedColumns
        };

        this._cardBoard = this.add(cardBoard);

    }

});