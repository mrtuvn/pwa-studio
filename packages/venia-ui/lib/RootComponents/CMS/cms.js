import React, { Fragment, useEffect } from 'react';
import { number, shape, string } from 'prop-types';
import { useQuery } from '@apollo/client';
import cmsPageQuery from '../../queries/getCmsPage.graphql';
import { fullPageLoadingIndicator } from '../../components/LoadingIndicator';
import RichContent from '../../components/RichContent';
import CategoryList from '../../components/CategoryList';
import { Meta, Title } from '../../components/Head';
import { mergeClasses } from '../../classify';

import defaultClasses from './cms.css';
import { useAppContext } from '@magento/peregrine/lib/context/app';

const CMSPage = props => {
    const { id } = props;
    const classes = mergeClasses(defaultClasses, props.classes);
    const { loading, error, data } = useQuery(cmsPageQuery, {
        variables: {
            id: Number(id)
        },
        fetchPolicy: 'cache-and-network'
    });
    const [
        { isPageLoading },
        {
            actions: { setPageLoading }
        }
    ] = useAppContext();

    // To prevent loading indicator from getting stuck, unset on unmount.
    useEffect(() => {
        return () => {
            setPageLoading(false);
        };
    }, [setPageLoading]);

    if (error) {
        return <div>Page Fetch Error</div>;
    }

    if (!data) {
        return fullPageLoadingIndicator;
    }

    // Ensure we mark the page as loading while we check the network for updates
    if (loading && !isPageLoading) {
        setPageLoading(true);
    } else if (!loading && isPageLoading) {
        setPageLoading(false);
    }

    const { content_heading, title } = data.cmsPage;

    const headingElement =
        content_heading !== '' ? (
            <h1 className={classes.heading}>{content_heading}</h1>
        ) : null;

    let content;
    // Only render <RichContent /> if the page isn't empty and doesn't contain the default CMS Page text.
    if (
        data.cmsPage.content &&
        data.cmsPage.content.length > 0 &&
        !data.cmsPage.content.includes('CMS homepage content goes here.')
    ) {
        content = (
            <Fragment>
                <Title>{title}</Title>
                {headingElement}
                <RichContent html={data.cmsPage.content} />
            </Fragment>
        );
    } else {
        content = <CategoryList title="Shop by category" id={2} />;
    }

    return (
        <Fragment>
            <Meta name="description" content={data.cmsPage.meta_description} />
            {content}
        </Fragment>
    );
};

CMSPage.propTypes = {
    id: number,
    classes: shape({
        heading: string
    })
};

export default CMSPage;
