//    await queryInSection(page, selectors[positions]);


//format:
    //first children : {nameOfWebpage: object}
        //second children : {nameOfPage: object}
            //third children and beyond: string or object
                //if string: selector
                //if object:
                    //selector(s): performs querySelector(All)
                    //fields[optional] : see third children and beyond
                    //attributes[optional] : string (default = 'innertext')
let selectors = {
    linkedIn : {
        logIn : {
            emailBox : '#login-email',
            passwordBox : '#login-password',
            submitButton : '#login-submit',
            searchBox : 'input[role=combobox]'
        },
        userProfile : {
            seeMore: {
                summary : '.pv-top-card-section__summary button[class~=pv-top-card-section__summary-toggle-button]' ,
                positions : '.pv-experience-section__see-more button' ,
                educations : '#education-section button.pv-profile-section__see-more-inline' ,
                skills : 'button.pv-skills-section__additional-skills' ,
                recommendations : '#recommendation-list + .artdeco-container-card-action-bar button' ,
                positions_roles : '.pv-position-entity button.pv-profile-section__see-more-inline' ,
                recommendations : '.pv-recommendation-entity__text a.lt-line-clamp__more'
            },
            header: "h1[class~='pv-top-card-section__name']",
            footer: '#footer-logo',
            profile: {
              selector: 'section.pv-profile-section.pv-top-card-section',
              fields: {
                name: 'h1[class~=pv-top-card-section__name]',
                headline: 'h2[class~=pv-top-card-section__headline]',
                location: 'h3[class~=pv-top-card-section__location]',
                summary: 'p[class~=pv-top-card-section__summary-text]',
                connections: '.pv-top-card-v2-section__connections',
              }
            },
            positions: {
              selector: 'section[id=experience-section] li.pv-profile-section',
              fields: {
                title: 'h3',
                companyName: 'span.pv-entity__secondary-title',
                location: 'pv-entity__location span:nth-child(2)',
                description: 'p[class~=pv-entity__description]',
                date1: 'h4.pv-entity__date-range span:nth-child(2)',
                date2: '.pv-entity__bullet-item-v2',
                roles: {
                  selector: '.pv-entity__role-details',
                  fields: {
                    title: 'h3 span:not(.visually-hidden)',
                    date1: 'h4.pv-entity__date-range span:nth-child(2)',
                    date2: '.pv-entity__bullet-item-v2',
                    location: 'pv-entity__location span:nth-child(2)'
                  }
                }
              }
            },
            educations: {
              selector: 'section[id=education-section] li',
              fields: {
                title: 'h3',
                degree: 'span[class=pv-entity__comma-item]',
                date1: 'p.pv-entity__dates time:nth-child(1)',
                date2: 'p.pv-entity__dates time:nth-child(2)'
              }
            },
            skills: {
              selector: '.pv-skill-category-entity__skill-wrapper',
              fields: {
                title: 'span.pv-skill-category-entity__name-text',
                count: 'span.pv-skill-category-entity__endorsement-count'
              }
            },
            recommendationsCount: {
              selector: '.recommendations-inlining',
              fields: {
                received: 'artdeco-tab:nth-child(1)',
                given: 'artdeco-tab:nth-child(2)'
              }
            },
            recommendationsReceived: {
              selector: 'artdeco-tabpanel[aria-hidden=false] li.pv-recommendation-entity',
              fields: {
                user: {
                  selector: 'a.pv-recommendation-entity__member',
                  attribute: 'href'
                },
                text: 'blockquote.pv-recommendation-entity__text'
              }
            },
            recommendationsGiven: {
              selector: 'artdeco-tabpanel[aria-hidden=true] li.pv-recommendation-entity',
              fields: {
                user: {
                  selector: 'a.pv-recommendation-entity__member',
                  attribute: 'href'
                },
                text: 'blockquote.pv-recommendation-entity__text'
              }
            },
            accomplishments: {
              selector: 'section.pv-accomplishments-section div.ember-view',
              fields: {
                count: 'h3.pv-accomplishments-block__count span:nth-child(2)',
                title: '.accomplishments-block__content h3.pv-accomplishments-block__title',
                items: {
                  selectors: 'li'
                }
              }
            },
            peopleAlsoViewed: {
              selector: 'li.pv-browsemap-section__member-container',
              fields: {
                user: {
                  selector: 'a',
                  attribute: 'href'
                },
                text: 'p'
              }
            },
            volunteerExperience: {
              selector: 'section.volunteering-section li',
              fields: {
                title: 'h3',
                experience: 'span[class=pv-entity__secondary-title]',
                location: 'pv-entity__location span:nth-child(2)',
                description: '.pv-volunteer-causes',
                date1: 'h4.pv-entity__date-range span:nth-child(2)',
                date2: '.pv-entity__bullet-item'
              }
            }
          }
          
    }
}

module.exports = selectors;