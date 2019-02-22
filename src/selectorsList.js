//format:
    //first children : {nameOfWebpage: object}
        //second children : {nameOfPage: object}
            //third children and beyond: string or object or null
                //if string: selector
                //if object:
                    //selector(s): performs querySelector(All)
                    //fields[optional] : see third children and beyond
                    //attributes[optional] : string (default = 'innertext')
                //if null: no query performed, property will be saved as null
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
            seeLess: {
              skills: 'button.pv-skills-section__additional-skills[aria-expanded=true]',
              positions : '.pv-profile-section__see-less-inline',
              positions_roles : '.pv-position-entity button.pv-profile-section__see-less-inline',
            },
            header: "h1[class~='pv-top-card-section__name']",
            footer: '#footer-logo',
            profile: {
              selector: 'section.pv-profile-section.pv-top-card-section',
              fields: {
                name: 'h1[class~=pv-top-card-section__name]',
                url: null,
                headline: 'h2[class~=pv-top-card-section__headline]',
                location: 'h3[class~=pv-top-card-section__location]',
                summary: 'p[class~=pv-top-card-section__summary-text]',
                connections: '.pv-top-card-v2-section__connections',
              }
            },
            positions: {
              selector: 'section[id=experience-section] li.pv-profile-section',
              fields: {
                name: 'span.pv-entity__secondary-title',
                position: 'h3',
                linkedInUrl: {
                  selector: 'a[data-control-name=background_details_company]',
                  attribute: 'href'
                },
                companyUrl: null,
                startToEnd: 'h4.pv-entity__date-range span:nth-child(2)',
                duration: '.pv-entity__bullet-item-v2',
                description: 'p[class~=pv-entity__description]',
                //========
                location: 'pv-entity__location span:nth-child(2)',
                //========
                roles: {
                  selector: '.pv-entity__role-details',
                  fields: {
                    name: null,
                    position: 'h3 span:not(.visually-hidden)',
                    linkedInUrl: null,
                    companyUrl: null,
                    startToEnd: 'h4.pv-entity__date-range span:nth-child(2)',
                    duration: '.pv-entity__bullet-item-v2',
                    description: 'p[class~=pv-entity__description]',
                    location: 'pv-entity__location span:nth-child(2)'
                  }
                }
              }
            },
            educations: {
              selector: 'section[id=education-section] li',
              fields: {
                name: 'h3',
                degree: 'span[class=pv-entity__comma-item]',
                start: 'p.pv-entity__dates time:nth-child(1)',
                end: 'p.pv-entity__dates time:nth-child(2)'
              }
            },
            skills: {
              selector: '.pv-skill-category-entity__skill-wrapper',
              fields: {
                name: 'span.pv-skill-category-entity__name-text',
                endorsements: 'span.pv-skill-category-entity__endorsement-count'
              }
            },
            // recommendationsCount: {
            //   selector: '.recommendations-inlining',
            //   fields: {
            //     received: 'artdeco-tab:nth-child(1)',
            //     given: 'artdeco-tab:nth-child(2)'
            //   }
            // },
            // recommendationsReceived: {
            //   selector: 'artdeco-tabpanel[aria-hidden=false] li.pv-recommendation-entity',
            //   fields: {
            //     user: {
            //       selector: 'a.pv-recommendation-entity__member',
            //       attribute: 'href'
            //     },
            //     text: 'blockquote.pv-recommendation-entity__text'
            //   }
            // },
            // recommendationsGiven: {
            //   selector: 'artdeco-tabpanel[aria-hidden=true] li.pv-recommendation-entity',
            //   fields: {
            //     user: {
            //       selector: 'a.pv-recommendation-entity__member',
            //       attribute: 'href'
            //     },
            //     text: 'blockquote.pv-recommendation-entity__text'
            //   }
            // },
            // accomplishments: {
            //   selector: 'section.pv-accomplishments-section div.ember-view',
            //   fields: {
            //     count: 'h3.pv-accomplishments-block__count span:nth-child(2)',
            //     title: '.accomplishments-block__content h3.pv-accomplishments-block__title',
            //     items: {
            //       selectors: 'li'
            //     }
            //   }
            // },
            // peopleAlsoViewed: {
            //   selector: 'li.pv-browsemap-section__member-container',
            //   fields: {
            //     user: {
            //       selector: 'a',
            //       attribute: 'href'
            //     },
            //     text: 'p'
            //   }
            // },
            volunteerExperience: {
              selector: 'section.volunteering-section li',
              fields: {
                name: 'span[class=pv-entity__secondary-title]',
                position: 'h3',
                description: '.pv-volunteer-causes',
                startToEnd: 'h4.pv-entity__date-range span:nth-child(2)',
                duration: '.pv-entity__bullet-item',
                location: 'pv-entity__location span:nth-child(2)'
              }
            }
          },
          companyProfile : {
            header: 'div[class=org-top-card__left-col]',
            topCard: {
              selector: 'div[class=org-top-card__left-col]',
              fields: {
                website: {
                  selector: 'a[data-control-name=top_card_view_website_custom_cta_btn]',
                  attribute: 'href'
                }
              }
            }
          },
          userSearch : {
            header: 'div.search-filters-bar',
            footer: '#footer-logo',
            numOfResultsBanner: {
              selector: 'div.blended-srp-results-js',
              fields: {
                numOfResults: 'h3.search-results__total'
              }
            },
            searchResult: {
              selector: 'div.search-result__info',
              fields: {
                profileUrl: {
                  selector: 'a[data-control-name=search_srp_result]',
                  attribute: 'href'
                }
              }
            },
            pages: {
              buttons: {
                selector: 'ol.results-paginator',
                fields: {
                  button: 'button'
                }
              }

            }
          },
          errorHandling: {
            captcha: 'div.recaptcha-checkbox-checkmark',
            defaultConfirmation: 'input[role=combobox]',
            feed: 'a.js-nav-item-link.active li-icon[type="nav-small-home-icon"]',
            signIn : {
              signIn1 : {
                email : '#login-email',
                password : '#login-password',
                submit : '#login-submit'
              },
              signIn2: {
                email: 'input#username',
                password: 'input#password',
                submit: 'button.btn__primary--large'
              },
              signIn3: {
                email: 'input.login-email',
                password: 'input.login-password',
                submit: 'input.login.submit-button'
              }
            }


          }
    }
}

module.exports = selectors;