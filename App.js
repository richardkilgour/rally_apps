Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {

        this.featureCardBoard = this.add({
            xtype: 'rallycardboard',
            types: ['portfolioItem/Feature'],
            attribute: 'Release',
            cardConfig: {
                xtype: 'rallycard',
                fields: ['Name']
            }
        });
        
        
    }

});
